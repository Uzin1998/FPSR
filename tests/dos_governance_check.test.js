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

test('validateStatusMachineSeparation allows explicit prohibition examples', () => {
  const errors = governance.validateStatusMachineSeparation(
    'docs/example.md',
    '禁止把 Jira Blocked 写入 archive 文档状态字段。\n',
  );

  assert.deepStrictEqual(errors, []);
});

test('validateStatusMachineSeparation allows prohibited examples inside prohibition blocks', () => {
  const errors = governance.validateStatusMachineSeparation(
    'docs/example.md',
    [
      '禁止：',
      '',
      '```text',
      '1. 把 [LOCKED] 当作 Jira Done。',
      '2. 把 Jira Review 写成设计卡验证状态。',
      '3. 把 Jira Blocked 写入 archive 文档状态字段。',
      '```',
    ].join('\n'),
  );

  assert.deepStrictEqual(errors, []);
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
