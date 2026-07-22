# Jira AI Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Jira REST CLI that lets the AI safely read and write the configured DOS Jira project.

**Architecture:** The CLI is a Node.js standard-library tool. Pure functions handle configuration, validation, DOS description generation, ADF conversion, JQL scoping, and request payload construction. A thin Jira client calls Jira Cloud REST API v3, and the CLI layer maps commands to pure functions or client calls.

**Tech Stack:** Node.js v14, CommonJS, built-in `assert`, built-in `http`/`https`, Jira Cloud REST API v3.

**Runtime Decision:** Python is unavailable in the current workspace (`python`, `py`, and `python3` cannot run). User approved switching implementation to Node.js on 2026-07-22.

**Workspace Note:** `e:\System` is not currently a Git repository. This plan uses verification checkpoints instead of commit steps.

---

## Files

- Create: `tools/jira_ai_control.js`
  - Owns CLI parsing, config loading, Jira API client, input validation, dry-run output, and command handlers.
- Create: `tests/jira_ai_control.test.js`
  - Owns no-network tests for config, validation, ADF conversion, JQL scoping, payload construction, and dry-run behavior.
- Create: `tools/jira_ai_control.env.example`
  - Shows required environment variables with placeholder values only.
- Remove: `tools/jira_ai_control.py`
  - Superseded by Node.js implementation because Python is unavailable.
- Remove: `tests/test_jira_ai_control.py`
  - Superseded by Node.js tests.
- Reference: `docs/superpowers/specs/2026-07-22-jira-ai-control-design.md`
  - Source of implementation requirements and acceptance criteria.

## Task 1: Replace Python Artifacts With Node Test First

**Files:**
- Delete: `tools/jira_ai_control.py`
- Delete: `tests/test_jira_ai_control.py`
- Create: `tests/jira_ai_control.test.js`

- [ ] **Step 1: Delete the non-runnable Python implementation and test files**

Remove:

```text
tools/jira_ai_control.py
tests/test_jira_ai_control.py
```

- [ ] **Step 2: Write failing Node tests**

Create `tests/jira_ai_control.test.js` with tests for:

```text
loadConfig
validateIssueType
validateTransitionStatus
buildDescriptionText
textToAdf
scopeJql
buildIssuePayload
dryRunResult
main doctor
main create dry-run
main transition archive-state rejection
```

- [ ] **Step 3: Run tests and verify failure is caused by missing module**

Run:

```powershell
node tests\jira_ai_control.test.js
```

Expected:

```text
Cannot find module '../tools/jira_ai_control'
```

## Task 2: Implement Pure Core And CLI

**Files:**
- Create: `tools/jira_ai_control.js`

- [ ] **Step 1: Implement Node module**

Create `tools/jira_ai_control.js` with:

```text
Constants:
  REQUIRED_ENV
  ALLOWED_ISSUE_TYPES
  JIRA_ACTION_STATUSES
  ARCHIVE_STATUSES

Errors:
  InputError
  ConfigError
  JiraApiError

Pure functions:
  loadConfig(env)
  validateIssueType(issueType)
  validateTransitionStatus(status)
  buildDescriptionText(options)
  textToAdf(text)
  scopeJql(projectKey, jql)
  buildIssuePayload(options)
  dryRunResult(method, path, payload)
  findTransitionId(transitionsResponse, targetStatus)

HTTP client:
  JiraClient.request(method, path, payload, params)
  JiraClient.myself()
  JiraClient.project()
  JiraClient.getIssue(issueKey)
  JiraClient.search(jql)
  JiraClient.createIssue(payload)
  JiraClient.transitions(issueKey)
  JiraClient.transition(issueKey, transitionId)
  JiraClient.comment(issueKey, body)

CLI:
  doctor
  whoami
  project
  get ISSUE_KEY
  search --jql "..."
  create --type TYPE --summary SUMMARY --artifact-id ID --truth-link PATH --source-id ID
  transition ISSUE_KEY --to STATUS
  comment ISSUE_KEY --body TEXT
```

Write command rules:

```text
create / transition / comment without --apply print dry-run JSON only.
create / transition / comment with --apply call Jira API.
dry-run JSON must not include Authorization or JIRA_API_TOKEN.
archive states must be rejected before any Jira API call.
```

- [ ] **Step 2: Run no-network tests**

Run:

```powershell
node tests\jira_ai_control.test.js
```

Expected:

```text
All tests passed.
```

## Task 3: Environment Example

**Files:**
- Create or update: `tools/jira_ai_control.env.example`

- [ ] **Step 1: Write placeholder-only environment example**

Create `tools/jira_ai_control.env.example` with:

```text
JIRA_BASE_URL=https://your-site.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=replace-with-atlassian-api-token
JIRA_PROJECT_KEY=DOS
```

- [ ] **Step 2: Verify no real token is present**

Run:

```powershell
rg -n "secret-token|replace-with-atlassian-api-token|Authorization|JIRA_API_TOKEN" tools tests
```

Expected:

```text
Only implementation references, placeholder token, and fake test token are found.
No real Jira token is present.
```

## Task 4: Local Command Verification

**Files:**
- Verify: `tools/jira_ai_control.js`

- [ ] **Step 1: Verify missing config is explicit**

Run:

```powershell
node tools\jira_ai_control.js doctor
```

Expected when variables are absent:

```text
Missing environment variables: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY
```

- [ ] **Step 2: Verify archive state rejection uses the required boundary text**

Run:

```powershell
$env:JIRA_BASE_URL="https://example.atlassian.net"
$env:JIRA_EMAIL="user@example.com"
$env:JIRA_API_TOKEN="secret-token"
$env:JIRA_PROJECT_KEY="DOS"
node tools\jira_ai_control.js transition DOS-1 --to "[TRIAGED]"
```

Expected:

```text
'[TRIAGED]' is an archive document state. archive document state cannot be written into Jira workflow.
```

- [ ] **Step 3: Verify create dry-run emits request payload and does not call Jira**

Run:

```powershell
node tools\jira_ai_control.js create --type Gap --summary "Establish central ID and evidence registry" --artifact-id GAP-ID-REGISTRY --truth-link docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md --source-id RULE-SRC-0003
```

Expected:

```text
"apply": false
"path": "/rest/api/3/issue"
"key": "DOS"
```

## Task 5: Real Jira Acceptance

**Files:**
- Verify: `tools/jira_ai_control.js`

- [ ] **Step 1: Set real Jira environment variables in the active terminal**

Run with real values supplied by the user:

```powershell
$env:JIRA_BASE_URL="https://your-site.atlassian.net"
$env:JIRA_EMAIL="your-email@example.com"
$env:JIRA_API_TOKEN="your-real-token"
$env:JIRA_PROJECT_KEY="DOS"
```

- [ ] **Step 2: Verify account identity**

Run:

```powershell
node tools\jira_ai_control.js whoami
```

Expected:

```text
JSON response includes accountId and displayName or emailAddress.
```

- [ ] **Step 3: Verify current project**

Run:

```powershell
node tools\jira_ai_control.js project
```

Expected:

```text
JSON response includes "key": "DOS" or the actual configured JIRA_PROJECT_KEY.
```

- [ ] **Step 4: Create a dry-run issue first**

Run:

```powershell
node tools\jira_ai_control.js create --type Gap --summary "AI control smoke test" --artifact-id GAP-JIRA-AI-CONTROL-SMOKE --truth-link docs/superpowers/specs/2026-07-22-jira-ai-control-design.md --source-id RULE-SRC-0004 --evidence-links docs/game_design_archive/06_rule_sources/README.md --decision-source "User approved Jira AI Control implementation plan on 2026-07-22."
```

Expected:

```text
"apply": false
No issue is created in Jira.
```

- [ ] **Step 5: Create the smoke-test issue with explicit apply**

Run:

```powershell
node tools\jira_ai_control.js create --type Gap --summary "AI control smoke test" --artifact-id GAP-JIRA-AI-CONTROL-SMOKE --truth-link docs/superpowers/specs/2026-07-22-jira-ai-control-design.md --source-id RULE-SRC-0004 --evidence-links docs/game_design_archive/06_rule_sources/README.md --decision-source "User approved Jira AI Control implementation plan on 2026-07-22." --apply
```

Expected:

```text
JSON response includes the created issue key, for example "key": "DOS-123".
```

- [ ] **Step 6: Read, comment, and transition the smoke-test issue**

Run with the created issue key:

```powershell
node tools\jira_ai_control.js get DOS-123
node tools\jira_ai_control.js comment DOS-123 --body "AI control smoke test comment via local REST CLI." --apply
node tools\jira_ai_control.js transition DOS-123 --to Review --apply
```

Expected:

```text
The issue can be read, receives the comment, and moves to Review if Jira exposes that transition.
```

## Self-Review Checklist

- [x] Spec coverage: every requirement in `2026-07-22-jira-ai-control-design.md` maps to a task above.
- [x] Runtime consistency: plan uses Node.js because Node is available and Python is unavailable.
- [x] Safety consistency: write commands require `--apply`; dry-run output omits Authorization and token.
- [x] Boundary consistency: archive states are rejected before Jira API calls.
