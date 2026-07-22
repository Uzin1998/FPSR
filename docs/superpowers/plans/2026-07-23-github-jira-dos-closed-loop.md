# GitHub Jira DOS Closed Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first rules-enforced GitHub + Jira closed loop for the DOS repository.

**Architecture:** GitHub stores Markdown truth, PR review, CI evidence, and merge history. Jira stores action state and Done evidence. A Node-based governance checker enforces Jira Key, PR traceability fields, rule-source headers, preserved RULE-SRC entries, state-machine separation, and existing Jira CLI tests without calling the Jira API.

**Tech Stack:** Git, GitHub, GitHub Actions, Jira Cloud DOS project, Node.js CommonJS scripts, dependency-free Node test harnesses.

---

## File Structure

- Create: `.gitignore`
- Create: `README.md`
- Create: `package.json`
- Create: `.github/pull_request_template.md`
- Create: `.github/CODEOWNERS`
- Create: `.github/workflows/dos-governance.yml`
- Create: `tools/dos_governance_check.js`
- Create: `tests/dos_governance_check.test.js`
- Create: `docs/jira/dos-issue-description-template.md`
- Modify: `tools/jira_ai_control.js`
- Modify: `tests/jira_ai_control.test.js`
- Reference spec: `docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md`
- Rule source: `docs/game_design_archive/06_rule_sources/README.md`

## Task 1: Initialize Git Repository Baseline

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `package.json`

- [ ] **Step 1: Initialize Git with main branch**

Run:

```powershell
git init -b main
```

Expected:

```text
Initialized empty Git repository in E:/System/.git/
```

- [ ] **Step 2: Add GitHub remote**

Run:

```powershell
git remote add origin https://github.com/Uzin1998/FPSR.git
git remote -v
```

Expected:

```text
origin  https://github.com/Uzin1998/FPSR.git (fetch)
origin  https://github.com/Uzin1998/FPSR.git (push)
```

- [ ] **Step 3: Create `.gitignore`**

Write this exact file:

```gitignore
.env
*.env
!*.env.example
tools/jira_ai_control.env
tools/jira_ai_control.local.env
node_modules/
npm-debug.log*
yarn-error.log*
coverage/
dist/
build/
.DS_Store
Thumbs.db
.vscode/
.idea/
.trae/
```

- [ ] **Step 4: Create root `README.md`**

Write this exact file:

```markdown
# FPSR

FPSR is the GitHub truth repository for the Design Operating System.

## Authority Boundaries

Markdown and Git are the semantic truth source for DOS design assets, rule sources, source custody, test definitions, reports, and governance scripts.

Jira DOS is the action-control layer for work state, blockers, review, and Done evidence.

GitHub Issues are not the authoritative task system. Issues are tracked in Jira DOS.

## Required Traceability

Every repository change must be traceable through:

```text
Jira issue
-> Git branch
-> Git commit
-> GitHub PR
-> CI governance check
-> Markdown, tool, or test change
-> Jira Done evidence
```

## Local Verification

Run:

```powershell
npm test
```
```

- [ ] **Step 5: Create initial `package.json`**

Write this exact file:

```json
{
  "name": "fpsr-dos",
  "version": "0.1.0",
  "private": true,
  "description": "Design Operating System governance tooling for FPSR.",
  "scripts": {
    "test": "node tests/jira_ai_control.test.js"
  },
  "engines": {
    "node": ">=14"
  }
}
```

- [ ] **Step 6: Run the current test suite**

Run:

```powershell
npm test
```

Expected:

```text
All tests passed (12).
```

- [ ] **Step 7: Commit repository baseline**

Run:

```powershell
git add .gitignore README.md package.json docs tools tests
git commit -m "DOS-1: initialize repository baseline"
```

Expected:

```text
[main <hash>] DOS-1: initialize repository baseline
```

## Task 2: Extend Jira CLI Description With GitHub Evidence

**Files:**
- Modify: `tests/jira_ai_control.test.js`
- Modify: `tools/jira_ai_control.js`

- [ ] **Step 1: Update Jira CLI test expectations first**

In `tests/jira_ai_control.test.js`, replace the `buildDescriptionText contains DOS binding block` test with:

```javascript
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
```

- [ ] **Step 2: Add a create-command test for GitHub evidence options**

Insert this test before `main transition rejects archive state before Jira API calls`:

```javascript
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
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```powershell
node tests\jira_ai_control.test.js
```

Expected:

```text
not ok - buildDescriptionText contains DOS and GitHub binding blocks
```

- [ ] **Step 4: Update `buildDescriptionText` in `tools/jira_ai_control.js`**

Replace the start of the `parts` array in `buildDescriptionText` with:

```javascript
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
```

- [ ] **Step 5: Update `buildIssuePayload` option forwarding**

Inside `buildIssuePayload`, add these keys to the object passed into `buildDescriptionText`:

```javascript
    githubPr: options.githubPr,
    gitCommit: options.gitCommit,
    githubEvidence: options.githubEvidence,
```

The full call must be:

```javascript
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
```

- [ ] **Step 6: Update create-command option parsing**

Inside the `create` command call to `buildIssuePayload`, add:

```javascript
        githubPr: parsed.options['github-pr'] || '',
        gitCommit: parsed.options['git-commit'] || '',
        githubEvidence: parsed.options['github-evidence'] || '',
```

The call must include:

```javascript
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
```

- [ ] **Step 7: Run Jira CLI tests**

Run:

```powershell
node tests\jira_ai_control.test.js
```

Expected:

```text
All tests passed (13).
```

- [ ] **Step 8: Commit Jira CLI evidence support**

Run:

```powershell
git add tools/jira_ai_control.js tests/jira_ai_control.test.js
git commit -m "DOS-1: add GitHub evidence to Jira issue payloads"
```

Expected:

```text
[main <hash>] DOS-1: add GitHub evidence to Jira issue payloads
```

## Task 3: Write Governance Check Tests

**Files:**
- Create: `tests/dos_governance_check.test.js`

- [ ] **Step 1: Create failing governance test file**

Write this exact file:

```javascript
const assert = require('assert');
const governance = require('../tools/dos_governance_check');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

const validBody = [
  'Jira Issue: DOS-1',
  'Change Type: governance',
  'Artifact IDs: N/A - no artifact changed',
  'Source IDs: RULE-SRC-0005',
  'Rule Sources: RULE-SRC-0005',
  'Truth Links: docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md',
  'Evidence: node tests/dos_governance_check.test.js',
  'Validation: npm test',
  'Done Check: N/A - verification PR not merged yet',
].join('\n');

test('validatePullRequestMetadata accepts complete DOS PR metadata', () => {
  const errors = governance.validatePullRequestMetadata({
    title: 'DOS-1: add governance checks',
    body: validBody,
  });

  assert.deepStrictEqual(errors, []);
});

test('validatePullRequestMetadata rejects missing Jira key', () => {
  const errors = governance.validatePullRequestMetadata({
    title: 'add governance checks',
    body: validBody.replace('Jira Issue: DOS-1', 'Jira Issue: N/A - missing issue is invalid'),
  });

  assert.ok(errors.some(error => error.includes('DOS Jira key')));
});

test('validatePullRequestMetadata rejects blank required field', () => {
  const errors = governance.validatePullRequestMetadata({
    title: 'DOS-1: add governance checks',
    body: validBody.replace('Truth Links: docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md', 'Truth Links:'),
  });

  assert.ok(errors.some(error => error.includes("Truth Links:")));
});

test('validateSpecFile requires rule source header for superpowers specs', () => {
  const errors = governance.validateSpecFile(
    'docs/superpowers/specs/2026-07-23-example.md',
    '# Example\n\n正文',
  );

  assert.ok(errors.some(error => error.includes('规则来源')));
});

test('validateSpecFile accepts rule source header for superpowers specs', () => {
  const errors = governance.validateSpecFile(
    'docs/superpowers/specs/2026-07-23-example.md',
    '# Example\n\n规则来源：RULE-SRC-0005 github-jira-dos-closed-loop-boundary\n',
  );

  assert.deepStrictEqual(errors, []);
});

test('validateRuleSourcesPreserved rejects deleted rule source IDs', () => {
  const errors = governance.validateRuleSourcesPreserved(
    'RULE-SRC-0001 brainstorming-spec-review-gate\nRULE-SRC-0005 github-jira-dos-closed-loop-boundary\n',
    'RULE-SRC-0001 brainstorming-spec-review-gate\n',
  );

  assert.ok(errors.some(error => error.includes('RULE-SRC-0005')));
});

test('validateStatusMachineSeparation rejects archive states as Jira workflow values', () => {
  const errors = governance.validateStatusMachineSeparation(
    'docs/example.md',
    'Jira workflow: [LOCKED]\n',
  );

  assert.ok(errors.some(error => error.includes('archive state')));
});

test('validateStatusMachineSeparation rejects Jira states as archive document values', () => {
  const errors = governance.validateStatusMachineSeparation(
    'docs/example.md',
    'archive status: Done\n',
  );

  assert.ok(errors.some(error => error.includes('Jira state')));
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
```

- [ ] **Step 2: Run test to verify it fails because implementation is absent**

Run:

```powershell
node tests\dos_governance_check.test.js
```

Expected:

```text
Cannot find module '../tools/dos_governance_check'
```

## Task 4: Implement Governance Check Script

**Files:**
- Create: `tools/dos_governance_check.js`

- [ ] **Step 1: Create governance checker implementation**

Write this exact file:

```javascript
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
    const pattern = new RegExp(`^${escapeRegExp(field)}\\s*(.*)$`, 'mi');
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

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
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
```

- [ ] **Step 2: Run governance tests**

Run:

```powershell
node tests\dos_governance_check.test.js
```

Expected:

```text
All tests passed (8).
```

- [ ] **Step 3: Run local governance check with complete PR metadata**

Run:

```powershell
$env:PR_TITLE='DOS-1: add governance checks'
$env:PR_BODY="Jira Issue: DOS-1`nChange Type: governance`nArtifact IDs: N/A - no artifact changed`nSource IDs: RULE-SRC-0005`nRule Sources: RULE-SRC-0005`nTruth Links: docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md`nEvidence: node tests/dos_governance_check.test.js`nValidation: npm test`nDone Check: N/A - local validation"
$env:CHANGED_FILES='docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md'
node tools\dos_governance_check.js
Remove-Item Env:\PR_TITLE
Remove-Item Env:\PR_BODY
Remove-Item Env:\CHANGED_FILES
```

Expected:

```text
DOS governance check passed.
```

- [ ] **Step 4: Commit governance checker**

Run:

```powershell
git add tools/dos_governance_check.js tests/dos_governance_check.test.js
git commit -m "DOS-1: add DOS governance checker"
```

Expected:

```text
[main <hash>] DOS-1: add DOS governance checker
```

## Task 5: Wire Unified Test Script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update `package.json` test script**

Replace `package.json` with:

```json
{
  "name": "fpsr-dos",
  "version": "0.1.0",
  "private": true,
  "description": "Design Operating System governance tooling for FPSR.",
  "scripts": {
    "test": "node tests/jira_ai_control.test.js && node tests/dos_governance_check.test.js"
  },
  "engines": {
    "node": ">=14"
  }
}
```

- [ ] **Step 2: Run unified tests**

Run:

```powershell
npm test
```

Expected:

```text
All tests passed (13).
All tests passed (8).
```

- [ ] **Step 3: Commit test script**

Run:

```powershell
git add package.json
git commit -m "DOS-1: wire unified governance tests"
```

Expected:

```text
[main <hash>] DOS-1: wire unified governance tests
```

## Task 6: Add GitHub PR Template, CODEOWNERS, And Workflow

**Files:**
- Create: `.github/pull_request_template.md`
- Create: `.github/CODEOWNERS`
- Create: `.github/workflows/dos-governance.yml`

- [ ] **Step 1: Create `.github/pull_request_template.md`**

Write this exact file:

```markdown
## DOS Traceability

Jira Issue:
Change Type:
Artifact IDs:
Source IDs:
Rule Sources:
Truth Links:
Evidence:
Validation:
Done Check:

## Notes

Use an explicit `N/A - reason` value for fields that do not apply. Blank fields fail DOS governance.
```

- [ ] **Step 2: Create `.github/CODEOWNERS`**

Write this exact file:

```text
* @Uzin1998
```

- [ ] **Step 3: Create `.github/workflows/dos-governance.yml`**

Write this exact file:

```yaml
name: DOS Governance

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  governance:
    name: governance
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Run tests
        run: npm test

      - name: Run DOS governance check
        if: github.event_name == 'pull_request'
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
          PR_BODY: ${{ github.event.pull_request.body }}
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha }}
        run: node tools/dos_governance_check.js
```

- [ ] **Step 4: Run unified tests locally**

Run:

```powershell
npm test
```

Expected:

```text
All tests passed (13).
All tests passed (8).
```

- [ ] **Step 5: Commit GitHub governance files**

Run:

```powershell
git add .github package.json tools tests
git commit -m "DOS-1: add GitHub governance workflow"
```

Expected:

```text
[main <hash>] DOS-1: add GitHub governance workflow
```

## Task 7: Add Jira Issue Description Template Document

**Files:**
- Create: `docs/jira/dos-issue-description-template.md`

- [ ] **Step 1: Create Jira template document**

Write this exact file:

```markdown
# DOS Jira Issue Description Template

规则来源：RULE-SRC-0005 github-jira-dos-closed-loop-boundary
适用对象：DOS Jira issue description、手工创建 Jira issue、本地 Jira REST CLI create 命令
不适用对象：Markdown 设计真相源、archive 文档状态机、GitHub PR 模板

## Template

```text
Artifact ID:
Truth Link:
Source ID:
Evidence Links:
Decision Source:
GitHub PR:
Git Commit:
GitHub Evidence:

Done Check:
- [ ] Markdown updated or no-doc-change reason recorded
- [ ] Artifact ID or Source ID bound
- [ ] Truth Link traceable
- [ ] Evidence links present for Decision/Bug/Gap/Validation
- [ ] GitHub PR linked when repository content changed
- [ ] Git commit linked when repository content changed
- [ ] No dangling referenced IDs
- [ ] Rule Source registered or cited if this issue creates a rule/status statement
```

## Usage

Paste the template into Jira issue descriptions when Jira project-level templates are unavailable.

When repository content changes, fill `GitHub PR`, `Git Commit`, and `GitHub Evidence` before moving the Jira issue to Done.
```

- [ ] **Step 2: Commit Jira template document**

Run:

```powershell
git add docs/jira/dos-issue-description-template.md
git commit -m "DOS-1: document Jira GitHub evidence template"
```

Expected:

```text
[main <hash>] DOS-1: document Jira GitHub evidence template
```

## Task 8: Push Main To GitHub

**Files:**
- No file edits.

- [ ] **Step 1: Verify local history and tests**

Run:

```powershell
git log --oneline --decorate -5
npm test
```

Expected:

```text
The five latest commits contain DOS-1 in each subject.
All tests passed (13).
All tests passed (8).
```

- [ ] **Step 2: Push main**

Run:

```powershell
git push -u origin main
```

Expected:

```text
branch 'main' set up to track 'origin/main'
```

## Task 9: Configure GitHub Branch Protection

**Files:**
- No file edits.

- [ ] **Step 1: Open repository branch settings**

Open:

```text
https://github.com/Uzin1998/FPSR/settings/branches
```

Expected:

```text
GitHub shows the Branches settings page for Uzin1998/FPSR.
```

- [ ] **Step 2: Add branch protection rule**

Create a rule for:

```text
Branch name pattern: main
```

Enable:

```text
Require a pull request before merging
Require status checks to pass before merging
Require branches to be up to date before merging
Require conversation resolution before merging
Block force pushes
Block deletions
```

Select required status check:

```text
governance
```

Expected:

```text
main branch protection is active and the governance status check is required.
```

- [ ] **Step 3: Record permission-limited settings**

When GitHub does not expose one of the requested settings for the account or plan, record the exact missing setting in Jira DOS-1 under Evidence Links.

Use this text:

```text
GitHub branch protection limitation:
- Repository: https://github.com/Uzin1998/FPSR
- Missing setting:
- Observed at:
- Impact:
```

## Task 10: Update Jira DOS Issue Evidence Template

**Files:**
- No repository file edits.

- [ ] **Step 1: Open Jira issue**

Open:

```text
https://915074691.atlassian.net/browse/DOS-1
```

Expected:

```text
Jira shows issue DOS-1.
```

- [ ] **Step 2: Add GitHub evidence fields to description**

Add or update the DOS binding block using:

```text
Artifact ID:
Truth Link:
Source ID:
Evidence Links:
Decision Source:
GitHub PR:
Git Commit:
GitHub Evidence:

Done Check:
- [ ] Markdown updated or no-doc-change reason recorded
- [ ] Artifact ID or Source ID bound
- [ ] Truth Link traceable
- [ ] Evidence links present for Decision/Bug/Gap/Validation
- [ ] GitHub PR linked when repository content changed
- [ ] Git commit linked when repository content changed
- [ ] No dangling referenced IDs
- [ ] Rule Source registered or cited if this issue creates a rule/status statement
```

Expected:

```text
DOS-1 contains GitHub PR, Git Commit, and GitHub Evidence fields.
```

## Task 11: Verify PR Governance Failure And Recovery

**Files:**
- Create: `docs/jira/verification-pr-note.md`

- [ ] **Step 1: Create verification branch**

Run:

```powershell
git checkout -b governance/DOS-1-verify-closed-loop
```

Expected:

```text
Switched to a new branch 'governance/DOS-1-verify-closed-loop'
```

- [ ] **Step 2: Create verification note**

Write this exact file:

```markdown
# Verification PR Note

规则来源：RULE-SRC-0005 github-jira-dos-closed-loop-boundary

This file exists to verify that GitHub PR metadata and DOS governance checks block incomplete traceability and pass complete traceability.
```

- [ ] **Step 3: Commit verification note**

Run:

```powershell
git add docs/jira/verification-pr-note.md
git commit -m "DOS-1: add verification PR note"
git push -u origin governance/DOS-1-verify-closed-loop
```

Expected:

```text
branch 'governance/DOS-1-verify-closed-loop' set up to track 'origin/governance/DOS-1-verify-closed-loop'
```

- [ ] **Step 4: Create an intentionally incomplete PR**

Open:

```text
https://github.com/Uzin1998/FPSR/compare/main...governance/DOS-1-verify-closed-loop
```

Create the PR with:

```text
Title: verify closed loop
Body:
Jira Issue:
Change Type:
Artifact IDs:
Source IDs:
Rule Sources:
Truth Links:
Evidence:
Validation:
Done Check:
```

Expected:

```text
GitHub Actions runs DOS Governance and the governance check fails.
```

- [ ] **Step 5: Update the same PR with complete metadata**

Edit the PR title:

```text
DOS-1: verify GitHub Jira closed loop
```

Replace the PR body with:

```text
Jira Issue: DOS-1
Change Type: governance
Artifact IDs: N/A - no artifact changed
Source IDs: RULE-SRC-0005
Rule Sources: RULE-SRC-0005
Truth Links: docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md
Evidence: docs/jira/verification-pr-note.md
Validation: npm test and GitHub Actions governance
Done Check: N/A - verification PR proves governance gate before merge
```

Expected:

```text
GitHub Actions reruns DOS Governance and the governance check passes.
```

- [ ] **Step 6: Merge verification PR**

Merge the PR after the `governance` status check passes.

Expected:

```text
The PR is merged into main and main remains protected by required checks.
```

## Task 12: Final Closure Evidence

**Files:**
- No file edits.

- [ ] **Step 1: Collect final evidence**

Record:

```text
GitHub repository URL: https://github.com/Uzin1998/FPSR
Merged verification PR URL:
Final merge commit:
GitHub Actions run URL:
Jira issue URL: https://915074691.atlassian.net/browse/DOS-1
Branch protection status: enabled
Permission-limited settings: none recorded or listed in DOS-1
```

- [ ] **Step 2: Update Jira DOS-1**

Update DOS-1 fields:

```text
GitHub PR: <merged verification PR URL>
Git Commit: <final merge commit>
GitHub Evidence: <GitHub Actions run URL>
Evidence Links: docs/jira/dos-issue-description-template.md; docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md
```

- [ ] **Step 3: Move Jira issue to Review**

Move DOS-1 to:

```text
Review
```

Expected:

```text
DOS-1 is ready for human Done review with GitHub evidence attached.
```

## Self-Review Checklist

- [ ] Every requirement in `docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md` maps to at least one task.
- [ ] Every new file has exact path and exact initial content.
- [ ] Every code change has a failing-test step before implementation.
- [ ] All test commands use `node tests\*.test.js` or `npm test`, not `node --test`.
- [ ] GitHub Actions does not call Jira API and does not read Jira token.
- [ ] Jira state and archive document state remain separate.
- [ ] Branch, commit, and PR examples all contain `DOS-1`.
- [ ] No task asks GitHub Issues to become the authoritative task system.
