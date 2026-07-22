const http = require('http');
const https = require('https');
const { URL } = require('url');

const REQUIRED_ENV = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY'];

const ALLOWED_ISSUE_TYPES = new Set([
  'Epic',
  'Task',
  'Bug',
  'Decision',
  'Research',
  'Gap',
  'Validation',
]);

const JIRA_ACTION_STATUSES = new Set([
  'Backlog',
  'Ready',
  'In Progress',
  'Blocked',
  'Review',
  'Done',
]);

const ARCHIVE_STATUSES = new Set([
  '[UNREAD]',
  '[TRIAGED]',
  '[OPEN]',
  '[HYPOTHESIS]',
  '[TESTING]',
  '[LOCKED]',
  '[REWORK]',
  '[REJECTED]',
]);

class InputError extends Error {}

class ConfigError extends Error {}

class JiraApiError extends Error {
  constructor(status, message, body = '') {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function loadConfig(env) {
  const missing = REQUIRED_ENV.filter(name => !env[name]);
  if (missing.length > 0) {
    return { config: null, missing };
  }

  return {
    config: {
      baseUrl: env.JIRA_BASE_URL.replace(/\/+$/, ''),
      email: env.JIRA_EMAIL,
      apiToken: env.JIRA_API_TOKEN,
      projectKey: env.JIRA_PROJECT_KEY,
    },
    missing: [],
  };
}

function requireConfig(env) {
  const result = loadConfig(env);
  if (result.missing.length > 0) {
    throw new ConfigError(`Missing environment variables: ${result.missing.join(', ')}`);
  }
  return result.config;
}

function validateIssueType(issueType) {
  if (!ALLOWED_ISSUE_TYPES.has(issueType)) {
    const allowed = Array.from(ALLOWED_ISSUE_TYPES).sort().join(', ');
    throw new InputError(`Unknown issue type '${issueType}'. Allowed issue types: ${allowed}`);
  }
}

function validateTransitionStatus(status) {
  if (ARCHIVE_STATUSES.has(status)) {
    throw new InputError(
      `'${status}' is an archive document state. archive document state cannot be written into Jira workflow.`,
    );
  }

  if (!JIRA_ACTION_STATUSES.has(status)) {
    const allowed = Array.from(JIRA_ACTION_STATUSES).sort().join(', ');
    throw new InputError(`Unknown Jira action status '${status}'. Allowed statuses: ${allowed}`);
  }
}

function buildDescriptionText(options) {
  const parts = [
    `Artifact ID: ${options.artifactId}`,
    `Truth Link: ${options.truthLink}`,
    `Source ID: ${options.sourceId || ''}`,
    `Evidence Links: ${options.evidenceLinks || ''}`,
    `Decision Source: ${options.decisionSource || ''}`,
    `GitHub PR: ${options.githubPr || ''}`,
    `Git Commit: ${options.gitCommit || ''}`,
    `GitHub Evidence: ${options.githubEvidence || ''}`,
    '',
    'Done Check:',
    '- [ ] Markdown updated or no-doc-change reason recorded',
    '- [ ] Artifact ID or Source ID bound',
    '- [ ] Truth Link traceable',
    '- [ ] Evidence links present for Decision/Bug/Gap/Validation',
    '- [ ] GitHub PR linked when repository content changed',
    '- [ ] Git commit linked when repository content changed',
    '- [ ] No dangling referenced IDs',
    '- [ ] Rule Source registered or cited if this issue creates a rule/status statement',
  ];

  if (options.body) {
    parts.push('', options.body);
  }

  return parts.join('\n');
}

function textToAdf(text) {
  const lines = text.split(/\r?\n/);
  const content = lines.map(line => {
    const paragraph = { type: 'paragraph' };
    if (line) {
      paragraph.content = [{ type: 'text', text: line }];
    }
    return paragraph;
  });

  if (content.length === 0) {
    content.push({ type: 'paragraph' });
  }

  return {
    type: 'doc',
    version: 1,
    content,
  };
}

function splitOrderBy(jql) {
  const match = /\border\s+by\b/i.exec(jql);
  if (!match) {
    return { body: jql.trim(), orderBy: '' };
  }

  return {
    body: jql.slice(0, match.index).trim(),
    orderBy: jql.slice(match.index + match[0].length).trim(),
  };
}

function scopeJql(projectKey, jql) {
  const split = splitOrderBy((jql || '').trim());
  const scopedBody = split.body ? `project = ${projectKey} AND (${split.body})` : `project = ${projectKey}`;
  return split.orderBy ? `${scopedBody} ORDER BY ${split.orderBy}` : scopedBody;
}

function buildIssuePayload(options) {
  validateIssueType(options.issueType);

  const description = buildDescriptionText({
    artifactId: options.artifactId,
    truthLink: options.truthLink,
    sourceId: options.sourceId,
    evidenceLinks: options.evidenceLinks,
    decisionSource: options.decisionSource,
    githubPr: options.githubPr,
    gitCommit: options.gitCommit,
    githubEvidence: options.githubEvidence,
    body: options.body,
  });

  return {
    fields: {
      project: { key: options.config.projectKey },
      issuetype: { name: options.issueType },
      summary: options.summary,
      description: textToAdf(description),
    },
  };
}

function dryRunResult(method, path, payload) {
  return {
    apply: false,
    method,
    path,
    payload: payload || {},
  };
}

function formatApiError(status, body) {
  if (status === 401) {
    return 'Authentication failed. Check JIRA_EMAIL and JIRA_API_TOKEN.';
  }
  if (status === 403) {
    return 'Permission denied. Check Jira project permissions or API token scope.';
  }
  if (status === 404) {
    return 'Project or issue was not found. Check JIRA_PROJECT_KEY and issue key.';
  }
  if (status === 429) {
    return 'Jira rate limit reached. Preserve the retry-after value from the response.';
  }
  return `Jira API error ${status}: ${body}`;
}

class JiraClient {
  constructor(config) {
    this.config = config;
  }

  request(method, path, payload, params) {
    const url = new URL(path, this.config.baseUrl);
    Object.entries(params || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const body = payload ? JSON.stringify(payload) : null;
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64')}`,
    };

    if (body) {
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const transport = url.protocol === 'http:' ? http : https;

    return new Promise((resolve, reject) => {
      const req = transport.request(url, { method, headers }, response => {
        const chunks = [];

        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const responseBody = Buffer.concat(chunks).toString('utf8');
          if (response.statusCode >= 400) {
            reject(new JiraApiError(response.statusCode, formatApiError(response.statusCode, responseBody), responseBody));
            return;
          }

          if (!responseBody) {
            resolve({});
            return;
          }

          try {
            resolve(JSON.parse(responseBody));
          } catch (error) {
            reject(new JiraApiError(response.statusCode, `Invalid JSON response: ${error.message}`, responseBody));
          }
        });
      });

      req.on('error', error => {
        reject(new JiraApiError(0, `Network error: ${error.message}`));
      });

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }

  myself() {
    return this.request('GET', '/rest/api/3/myself');
  }

  project() {
    return this.request('GET', `/rest/api/3/project/${this.config.projectKey}`);
  }

  getIssue(issueKey) {
    return this.request('GET', `/rest/api/3/issue/${issueKey}`);
  }

  search(jql) {
    return this.request('GET', '/rest/api/3/search', null, {
      jql: scopeJql(this.config.projectKey, jql),
    });
  }

  createIssue(payload) {
    return this.request('POST', '/rest/api/3/issue', payload);
  }

  transitions(issueKey) {
    return this.request('GET', `/rest/api/3/issue/${issueKey}/transitions`);
  }

  transition(issueKey, transitionId) {
    return this.request('POST', `/rest/api/3/issue/${issueKey}/transitions`, {
      transition: { id: transitionId },
    });
  }

  comment(issueKey, body) {
    return this.request('POST', `/rest/api/3/issue/${issueKey}/comment`, {
      body: textToAdf(body),
    });
  }
}

function findTransitionId(transitionsResponse, targetStatus) {
  const transitions = transitionsResponse.transitions || [];
  const match = transitions.find(transition => {
    const transitionName = transition.name;
    const toName = transition.to && transition.to.name;
    return transitionName === targetStatus || toName === targetStatus;
  });

  if (!match) {
    throw new InputError(`No available transition to '${targetStatus}' for this issue.`);
  }

  return String(match.id);
}

function parseArgs(argv) {
  const command = argv[0];
  if (!command) {
    throw new InputError('Missing command.');
  }

  const positionals = [];
  const options = {};

  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const name = token.slice(2);
    if (name === 'apply') {
      options.apply = true;
      continue;
    }

    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new InputError(`Missing value for --${name}.`);
    }
    options[name] = value;
    index += 1;
  }

  return { command, positionals, options };
}

function requiredOption(options, name) {
  if (!options[name]) {
    throw new InputError(`Missing required option --${name}.`);
  }
  return options[name];
}

function printJson(stdout, value) {
  stdout(JSON.stringify(value, null, 2));
}

async function main(argv = process.argv.slice(2), env = process.env, stdout = console.log, stderr = console.error) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    stderr(error.message);
    return 2;
  }

  const configResult = loadConfig(env);
  if (parsed.command === 'doctor') {
    if (configResult.missing.length > 0) {
      stderr(`Missing environment variables: ${configResult.missing.join(', ')}`);
      return 2;
    }
    stdout(`Jira AI control config OK for project ${configResult.config.projectKey}.`);
    return 0;
  }

  if (configResult.missing.length > 0) {
    stderr(`Missing environment variables: ${configResult.missing.join(', ')}`);
    return 2;
  }

  const config = configResult.config;
  const client = new JiraClient(config);

  try {
    if (parsed.command === 'whoami') {
      printJson(stdout, await client.myself());
      return 0;
    }

    if (parsed.command === 'project') {
      printJson(stdout, await client.project());
      return 0;
    }

    if (parsed.command === 'get') {
      const issueKey = parsed.positionals[0];
      if (!issueKey) {
        throw new InputError('Missing ISSUE_KEY.');
      }
      printJson(stdout, await client.getIssue(issueKey));
      return 0;
    }

    if (parsed.command === 'search') {
      printJson(stdout, await client.search(parsed.options.jql || ''));
      return 0;
    }

    if (parsed.command === 'create') {
      const payload = buildIssuePayload({
        config,
        issueType: requiredOption(parsed.options, 'type'),
        summary: requiredOption(parsed.options, 'summary'),
        artifactId: requiredOption(parsed.options, 'artifact-id'),
        truthLink: requiredOption(parsed.options, 'truth-link'),
        sourceId: parsed.options['source-id'] || '',
        evidenceLinks: parsed.options['evidence-links'] || '',
        decisionSource: parsed.options['decision-source'] || '',
        githubPr: parsed.options['github-pr'] || '',
        gitCommit: parsed.options['git-commit'] || '',
        githubEvidence: parsed.options['github-evidence'] || '',
        body: parsed.options.body || '',
      });

      if (!parsed.options.apply) {
        printJson(stdout, dryRunResult('POST', '/rest/api/3/issue', payload));
        return 0;
      }

      printJson(stdout, await client.createIssue(payload));
      return 0;
    }

    if (parsed.command === 'transition') {
      const issueKey = parsed.positionals[0];
      if (!issueKey) {
        throw new InputError('Missing ISSUE_KEY.');
      }
      const targetStatus = requiredOption(parsed.options, 'to');
      validateTransitionStatus(targetStatus);
      const path = `/rest/api/3/issue/${issueKey}/transitions`;

      if (!parsed.options.apply) {
        printJson(stdout, dryRunResult('POST', path, { target_status: targetStatus }));
        return 0;
      }

      const transitionId = findTransitionId(await client.transitions(issueKey), targetStatus);
      printJson(stdout, await client.transition(issueKey, transitionId));
      return 0;
    }

    if (parsed.command === 'comment') {
      const issueKey = parsed.positionals[0];
      if (!issueKey) {
        throw new InputError('Missing ISSUE_KEY.');
      }
      const body = requiredOption(parsed.options, 'body');
      const path = `/rest/api/3/issue/${issueKey}/comment`;
      const payload = { body: textToAdf(body) };

      if (!parsed.options.apply) {
        printJson(stdout, dryRunResult('POST', path, payload));
        return 0;
      }

      printJson(stdout, await client.comment(issueKey, body));
      return 0;
    }

    throw new InputError(`Unhandled command: ${parsed.command}`);
  } catch (error) {
    if (error instanceof InputError || error instanceof ConfigError || error instanceof JiraApiError) {
      stderr(error.message);
      return error instanceof JiraApiError ? 1 : 2;
    }
    stderr(error && error.message ? error.message : String(error));
    return 1;
  }
}

module.exports = {
  REQUIRED_ENV,
  ALLOWED_ISSUE_TYPES,
  JIRA_ACTION_STATUSES,
  ARCHIVE_STATUSES,
  InputError,
  ConfigError,
  JiraApiError,
  JiraClient,
  loadConfig,
  requireConfig,
  validateIssueType,
  validateTransitionStatus,
  buildDescriptionText,
  textToAdf,
  scopeJql,
  buildIssuePayload,
  dryRunResult,
  findTransitionId,
  parseArgs,
  main,
};

if (require.main === module) {
  main().then(exitCode => {
    process.exitCode = exitCode;
  });
}
