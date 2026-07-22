const assert = require('assert');
const jira = require('../tools/jira_ai_control');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('loadConfig reports missing environment variables', () => {
  const result = jira.loadConfig({});

  assert.strictEqual(result.config, null);
  assert.deepStrictEqual(result.missing, [
    'JIRA_BASE_URL',
    'JIRA_EMAIL',
    'JIRA_API_TOKEN',
    'JIRA_PROJECT_KEY',
  ]);
});

test('loadConfig normalizes base URL', () => {
  const result = jira.loadConfig({
    JIRA_BASE_URL: 'https://example.atlassian.net/',
    JIRA_EMAIL: 'user@example.com',
    JIRA_API_TOKEN: 'secret-token',
    JIRA_PROJECT_KEY: 'DOS',
  });

  assert.deepStrictEqual(result.missing, []);
  assert.strictEqual(result.config.baseUrl, 'https://example.atlassian.net');
  assert.strictEqual(result.config.projectKey, 'DOS');
});

test('validateIssueType accepts DOS types and rejects unknown types', () => {
  jira.validateIssueType('Gap');

  assert.throws(() => jira.validateIssueType('Story'), /Unknown issue type/);
});

test('validateTransitionStatus rejects archive states', () => {
  jira.validateTransitionStatus('Review');

  assert.throws(() => jira.validateTransitionStatus('[TRIAGED]'), /archive document state/);
});

test('buildDescriptionText contains DOS and GitHub binding blocks', () => {
  const text = jira.buildDescriptionText({
    artifactId: 'GAP-ID-REGISTRY',
    truthLink: 'docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md',
    sourceId: 'RULE-SRC-0003',
    evidenceLinks: 'docs/game_design_archive/06_rule_sources/README.md',
    decisionSource: 'Workflow review section 3.7 marks ID/hash dedup as PENDING_ACTION.',
    githubPr: 'https://github.com/Uzin1998/FPSR/pull/1',
    gitCommit: 'abc1234',
    githubEvidence: 'CI passed on GitHub Actions run 1',
  });

  assert.ok(text.includes('Artifact ID: GAP-ID-REGISTRY'));
  assert.ok(text.includes('Truth Link: docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md'));
  assert.ok(text.includes('Source ID: RULE-SRC-0003'));
  assert.ok(text.includes('GitHub PR: https://github.com/Uzin1998/FPSR/pull/1'));
  assert.ok(text.includes('Git Commit: abc1234'));
  assert.ok(text.includes('GitHub Evidence: CI passed on GitHub Actions run 1'));
  assert.ok(text.includes('GitHub PR linked when repository content changed'));
  assert.ok(text.includes('Git commit linked when repository content changed'));
  assert.ok(text.includes('Done Check:'));
  assert.ok(text.includes('Rule Source registered or cited'));
});

test('textToAdf preserves lines as Jira document paragraphs', () => {
  const adf = jira.textToAdf('Line one\n\nLine two');

  assert.strictEqual(adf.type, 'doc');
  assert.strictEqual(adf.version, 1);
  assert.strictEqual(adf.content.length, 3);
  assert.strictEqual(adf.content[0].content[0].text, 'Line one');
  assert.strictEqual(adf.content[2].content[0].text, 'Line two');
});

test('scopeJql limits search to configured project and preserves order by', () => {
  assert.strictEqual(
    jira.scopeJql('DOS', 'status = Done ORDER BY created DESC'),
    'project = DOS AND (status = Done) ORDER BY created DESC',
  );
});

test('buildIssuePayload uses project key, type, summary, and ADF description', () => {
  const result = jira.loadConfig({
    JIRA_BASE_URL: 'https://example.atlassian.net',
    JIRA_EMAIL: 'user@example.com',
    JIRA_API_TOKEN: 'secret-token',
    JIRA_PROJECT_KEY: 'DOS',
  });

  const payload = jira.buildIssuePayload({
    config: result.config,
    issueType: 'Gap',
    summary: 'Establish central ID and evidence registry',
    artifactId: 'GAP-ID-REGISTRY',
    truthLink: 'docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md',
    sourceId: 'RULE-SRC-0003',
    evidenceLinks: 'docs/game_design_archive/06_rule_sources/README.md',
    decisionSource: 'Workflow review section 3.7 marks ID/hash dedup as PENDING_ACTION.',
  });

  assert.strictEqual(payload.fields.project.key, 'DOS');
  assert.strictEqual(payload.fields.issuetype.name, 'Gap');
  assert.strictEqual(payload.fields.summary, 'Establish central ID and evidence registry');
  assert.strictEqual(payload.fields.description.type, 'doc');
});

test('dryRunResult hides token and marks apply false', () => {
  const result = jira.dryRunResult('POST', '/rest/api/3/issue', {
    fields: { summary: 'Example' },
  });
  const encoded = JSON.stringify(result);

  assert.strictEqual(result.apply, false);
  assert.ok(!encoded.includes('Authorization'));
  assert.ok(!encoded.includes('secret-token'));
});

test('main doctor returns nonzero when config is missing', async () => {
  const output = [];

  const exitCode = await jira.main(['doctor'], {}, line => output.push(line), line => output.push(line));

  assert.strictEqual(exitCode, 2);
  assert.ok(output.some(line => line.includes('JIRA_BASE_URL')));
});

test('main create without apply prints dry-run payload', async () => {
  const output = [];
  const env = {
    JIRA_BASE_URL: 'https://example.atlassian.net',
    JIRA_EMAIL: 'user@example.com',
    JIRA_API_TOKEN: 'secret-token',
    JIRA_PROJECT_KEY: 'DOS',
  };

  const exitCode = await jira.main(
    [
      'create',
      '--type',
      'Gap',
      '--summary',
      'Establish central ID and evidence registry',
      '--artifact-id',
      'GAP-ID-REGISTRY',
      '--truth-link',
      'docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md',
      '--source-id',
      'RULE-SRC-0003',
    ],
    env,
    line => output.push(line),
    line => output.push(line),
  );

  const rendered = output.join('\n');
  assert.strictEqual(exitCode, 0);
  assert.ok(rendered.includes('"apply": false'));
  assert.ok(rendered.includes('"path": "/rest/api/3/issue"'));
  assert.ok(rendered.includes('GAP-ID-REGISTRY'));
  assert.ok(!rendered.includes('secret-token'));
});

test('main create dry-run accepts GitHub evidence options', async () => {
  const output = [];
  const env = {
    JIRA_BASE_URL: 'https://example.atlassian.net',
    JIRA_EMAIL: 'user@example.com',
    JIRA_API_TOKEN: 'secret-token',
    JIRA_PROJECT_KEY: 'DOS',
  };

  const exitCode = await jira.main(
    [
      'create',
      '--type',
      'Gap',
      '--summary',
      'Establish central ID and evidence registry',
      '--artifact-id',
      'GAP-ID-REGISTRY',
      '--truth-link',
      'docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md',
      '--source-id',
      'RULE-SRC-0003',
      '--github-pr',
      'https://github.com/Uzin1998/FPSR/pull/1',
      '--git-commit',
      'abc1234',
      '--github-evidence',
      'CI passed on GitHub Actions run 1',
    ],
    env,
    line => output.push(line),
    line => output.push(line),
  );

  const rendered = output.join('\n');
  assert.strictEqual(exitCode, 0);
  assert.ok(rendered.includes('GitHub PR: https://github.com/Uzin1998/FPSR/pull/1'));
  assert.ok(rendered.includes('Git Commit: abc1234'));
  assert.ok(rendered.includes('GitHub Evidence: CI passed on GitHub Actions run 1'));
  assert.ok(!rendered.includes('secret-token'));
});

test('main transition rejects archive state before Jira API calls', async () => {
  const output = [];
  const env = {
    JIRA_BASE_URL: 'https://example.atlassian.net',
    JIRA_EMAIL: 'user@example.com',
    JIRA_API_TOKEN: 'secret-token',
    JIRA_PROJECT_KEY: 'DOS',
  };

  const exitCode = await jira.main(
    ['transition', 'DOS-1', '--to', '[TRIAGED]'],
    env,
    line => output.push(line),
    line => output.push(line),
  );

  assert.strictEqual(exitCode, 2);
  assert.ok(output.join('\n').includes('archive document state'));
});

async function run() {
  let failed = 0;
  for (const entry of tests) {
    try {
      await entry.fn();
      console.log(`ok - ${entry.name}`);
    } catch (error) {
      failed += 1;
      console.error(`not ok - ${entry.name}`);
      console.error(error && error.stack ? error.stack : String(error));
    }
  }

  if (failed > 0) {
    console.error(`${failed} test(s) failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`All tests passed (${tests.length}).`);
}

run();
