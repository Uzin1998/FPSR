const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const REQUIRED_PR_FIELDS = [
  'Jira Issue:',
  'Change Type:',
  'Artifact IDs:',
  'Source IDs:',
  'Rule Sources:',
  'Truth Links:',
  'Evidence:',
  'Validation:',
  'Done Check:',
];

const JIRA_KEY_PATTERN = /\bDOS-\d+\b/;
const RULE_SOURCE_PATTERN = /\bRULE-SRC-\d{4}\b/g;
const RULE_SOURCE_HEADER_PATTERN = /^规则来源：.*\bRULE-SRC-\d{4}\b/m;
const RULE_SOURCES_PATH = 'docs/game_design_archive/06_rule_sources/README.md';

const ARCHIVE_STATUS_PATTERN = /\[(UNREAD|TRIAGED|OPEN|HYPOTHESIS|TESTING|LOCKED|REWORK|REJECTED)\]/;
const JIRA_STATUS_PATTERN = /\b(Backlog|Ready|In Progress|Blocked|Review|Done)\b/;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function extractRuleSourceIds(text) {
  return Array.from(new Set(text.match(RULE_SOURCE_PATTERN) || [])).sort();
}

function validatePullRequestMetadata(metadata) {
  const title = metadata.title || '';
  const body = metadata.body || '';
  const combined = `${title}\n${body}`;
  const errors = [];

  if (!JIRA_KEY_PATTERN.test(combined)) {
    errors.push('PR title or body must contain a DOS Jira key such as DOS-1.');
  }

  REQUIRED_PR_FIELDS.forEach(field => {
    const pattern = new RegExp(`^${escapeRegExp(field)}[ \\t]*(.*)$`, 'mi');
    const match = pattern.exec(body);
    if (!match) {
      errors.push(`PR body missing required field '${field}'.`);
      return;
    }

    if (!match[1].trim()) {
      errors.push(`PR body field '${field}' must not be blank; use a concrete value or an explicit N/A reason.`);
    }
  });

  return errors;
}

function validateSpecFile(filePath, content) {
  const normalized = normalizePath(filePath);
  if (!normalized.startsWith('docs/superpowers/specs/')) {
    return [];
  }

  if (RULE_SOURCE_HEADER_PATTERN.test(content)) {
    return [];
  }

  return [`${normalized} must contain a 规则来源 header with a RULE-SRC ID.`];
}

function validateRuleSourcesPreserved(beforeText, afterText) {
  const beforeIds = extractRuleSourceIds(beforeText || '');
  const afterIds = new Set(extractRuleSourceIds(afterText || ''));
  return beforeIds
    .filter(id => !afterIds.has(id))
    .map(id => `${RULE_SOURCES_PATH} must not delete existing rule source ${id}.`);
}

function validateStatusMachineSeparation(filePath, content) {
  const errors = [];
  const lines = content.split(/\r?\n/);
  const normalized = normalizePath(filePath);
  let inFence = false;
  let fenceIsProhibitionExample = false;
  let pendingProhibitionExample = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const isProhibition = /禁止|不得|不能|must\s+not|do\s+not/i.test(line);
    const isFence = /^\s*```/.test(line);

    if (isFence) {
      inFence = !inFence;
      if (inFence) {
        fenceIsProhibitionExample = pendingProhibitionExample;
        pendingProhibitionExample = false;
      } else {
        fenceIsProhibitionExample = false;
      }
      return;
    }

    if (isProhibition) {
      pendingProhibitionExample = true;
      return;
    }

    if (inFence && fenceIsProhibitionExample) {
      return;
    }

    const mentionsJiraWorkflow = /Jira\s*(workflow|status|状态|工作流)/i.test(line);
    const mentionsArchiveStatus = /archive\s*(status|状态|文档状态|document state)/i.test(line);

    if (mentionsJiraWorkflow && ARCHIVE_STATUS_PATTERN.test(line)) {
      errors.push(`${normalized}:${lineNumber} writes an archive state into a Jira workflow/status line.`);
    }

    if (mentionsArchiveStatus && JIRA_STATUS_PATTERN.test(line)) {
      errors.push(`${normalized}:${lineNumber} writes a Jira state into an archive document status line.`);
    }
  });

  return errors;
}

function readPullRequestMetadata(env) {
  if (env.GITHUB_EVENT_PATH && fs.existsSync(env.GITHUB_EVENT_PATH)) {
    const event = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
    if (event.pull_request) {
      return {
        title: event.pull_request.title || '',
        body: event.pull_request.body || '',
        baseSha: event.pull_request.base && event.pull_request.base.sha ? event.pull_request.base.sha : '',
        headSha: event.pull_request.head && event.pull_request.head.sha ? event.pull_request.head.sha : '',
      };
    }
  }

  return {
    title: env.PR_TITLE || '',
    body: env.PR_BODY || '',
    baseSha: env.BASE_SHA || '',
    headSha: env.HEAD_SHA || '',
  };
}

function splitChangedFiles(value) {
  return (value || '')
    .split(/[\r\n,]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .map(normalizePath);
}

function gitOutput(repoRoot, args) {
  return childProcess.execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function getChangedFiles(repoRoot, env, metadata) {
  const fromEnv = splitChangedFiles(env.CHANGED_FILES || '');
  if (fromEnv.length > 0) {
    return fromEnv;
  }

  if (metadata.baseSha && metadata.headSha) {
    return splitChangedFiles(gitOutput(repoRoot, ['diff', '--name-only', metadata.baseSha, metadata.headSha]));
  }

  return splitChangedFiles(gitOutput(repoRoot, ['diff', '--name-only', 'HEAD']));
}

function readFileAtRevision(repoRoot, revision, relativePath) {
  try {
    return gitOutput(repoRoot, ['show', `${revision}:${relativePath}`]);
  } catch (error) {
    return '';
  }
}

function validateChangedFiles(repoRoot, changedFiles, baseSha) {
  const errors = [];

  changedFiles.forEach(filePath => {
    const normalized = normalizePath(filePath);
    const absolutePath = path.join(repoRoot, normalized);
    if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) {
      return;
    }

    const content = fs.readFileSync(absolutePath, 'utf8');
    errors.push(...validateSpecFile(normalized, content));
    errors.push(...validateStatusMachineSeparation(normalized, content));

    if (normalized === RULE_SOURCES_PATH && baseSha) {
      const beforeText = readFileAtRevision(repoRoot, baseSha, RULE_SOURCES_PATH);
      errors.push(...validateRuleSourcesPreserved(beforeText, content));
    }
  });

  return errors;
}

function runGovernanceCheck(options) {
  const repoRoot = options.repoRoot;
  const env = options.env || process.env;
  const metadata = readPullRequestMetadata(env);
  const changedFiles = getChangedFiles(repoRoot, env, metadata);
  const errors = [];

  errors.push(...validatePullRequestMetadata(metadata));
  errors.push(...validateChangedFiles(repoRoot, changedFiles, metadata.baseSha));

  return errors;
}

async function main(env = process.env, stdout = console.log, stderr = console.error) {
  let errors;
  try {
    errors = runGovernanceCheck({
      repoRoot: process.cwd(),
      env,
    });
  } catch (error) {
    stderr(error && error.message ? error.message : String(error));
    return 1;
  }

  if (errors.length > 0) {
    errors.forEach(error => stderr(`ERROR: ${error}`));
    return 1;
  }

  stdout('DOS governance check passed.');
  return 0;
}

module.exports = {
  REQUIRED_PR_FIELDS,
  extractRuleSourceIds,
  validatePullRequestMetadata,
  validateSpecFile,
  validateRuleSourcesPreserved,
  validateStatusMachineSeparation,
  readPullRequestMetadata,
  splitChangedFiles,
  getChangedFiles,
  validateChangedFiles,
  runGovernanceCheck,
  main,
};

if (require.main === module) {
  main().then(exitCode => {
    process.exitCode = exitCode;
  });
}
