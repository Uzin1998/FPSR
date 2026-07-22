# Jira Operating Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new Jira Software Kanban project that acts as the execution-control layer for the Design Operating System.

**Architecture:** Jira stores actionable work, workflow state, blockers, review state, and completion checks. Markdown/Git remains the semantic truth source, with Jira issues bound back to Artifact IDs, Source IDs, and Truth Links.

**Tech Stack:** Jira Software Cloud, Team-managed Kanban project, project-local issue types, project fields, board columns, issue templates.

---

## Files

- Reference spec: `docs/superpowers/specs/2026-07-22-jira-operating-layer-design.md`
- No source code files are modified by this plan.

## Task 1: Enter Jira And Create Project

- [ ] **Step 1: Open Atlassian start page**

Open:

```text
https://start.atlassian.com/
```

Expected:

```text
The browser shows the logged-in Atlassian home or product selector.
```

- [ ] **Step 2: Enter Jira**

Select Jira Software from the Atlassian product list.

Expected:

```text
The Jira product home opens without asking for credentials.
```

- [ ] **Step 3: Start project creation**

Click Create project.

Expected:

```text
A template picker or project creation screen appears.
```

- [ ] **Step 4: Choose Kanban**

Select:

```text
Product: Jira Software
Template: Kanban
Project type: Team-managed
```

Expected:

```text
The project creation form asks for project name and key.
```

- [ ] **Step 5: Create DOS project**

Use:

```text
Project name: Design Operating System
Project key: DOS
```

Expected:

```text
The new Jira project opens.
```

If `DOS` is unavailable, use:

```text
Project key: GDOS
```

and record the actual key in the final report.

## Task 2: Configure Issue Types

- [ ] **Step 1: Open project settings**

Open the new project's Project settings.

Expected:

```text
The project settings sidebar is visible.
```

- [ ] **Step 2: Open issue types**

Open Issue types.

Expected:

```text
The project issue type configuration page is visible.
```

- [ ] **Step 3: Ensure required issue types exist**

Create or keep these issue types:

```text
Epic
Task
Bug
Decision
Research
Gap
Validation
```

Expected:

```text
All seven issue types are selectable in the project.
```

- [ ] **Step 4: Apply boundary descriptions**

Use these descriptions where Jira allows description text:

```text
Epic: System domain or long-running design domain.
Task: Concrete execution action.
Bug: Existing rule violation. Do not use for missing information.
Decision: Design ruling with source and impact scope.
Research: Investigation or source-checking work.
Gap: Missing information, missing evidence, unknown field, or pending decision.
Validation: Simulation, test, sample-statistics, or rule-checking task.
```

Expected:

```text
Issue type meaning is visible in Jira where supported.
```

If descriptions are not supported, put the definitions in a project pinned issue named `DOS Jira Operating Rules`.

## Task 3: Configure Fields Or Description Template

- [ ] **Step 1: Add project fields if available**

Create these project-local fields:

```text
Artifact ID: Short text
Truth Link: URL or Paragraph
Source ID: Short text
Evidence Links: Paragraph
Decision Source: Paragraph
```

Expected:

```text
The fields can be added to at least Task, Decision, Bug, Gap, and Validation.
```

- [ ] **Step 2: If custom fields are unavailable, use description template**

Add this template to issue descriptions where Jira supports templates:

```text
Artifact ID:
Truth Link:
Source ID:
Evidence Links:
Decision Source:
Done Check:
- [ ] Markdown updated or no-doc-change reason recorded
- [ ] Artifact ID or Source ID bound
- [ ] Truth Link traceable
- [ ] Evidence links present for Decision/Bug/Gap/Validation
- [ ] No dangling referenced IDs
- [ ] Rule Source registered or cited if this issue creates a rule/status statement
```

Expected:

```text
Every new issue has a usable DOS binding block either as fields or in Description.
```

## Task 4: Configure Board Columns

- [ ] **Step 1: Open board settings**

Open board settings or columns configuration.

Expected:

```text
Kanban board columns are editable.
```

- [ ] **Step 2: Configure columns**

Use:

```text
Backlog
Ready
In Progress
Blocked
Review
Done
```

Expected:

```text
The board columns reflect Jira action flow only.
```

- [ ] **Step 3: Avoid archive states**

Do not add these as Jira workflow columns:

```text
UNREAD
TRIAGED
OPEN
HYPOTHESIS
TESTING
LOCKED
REWORK
REJECTED
```

Expected:

```text
Jira workflow remains separate from docs/game_design_archive status.
```

## Task 5: Create Seed Work Items

- [ ] **Step 1: Create governance Epic**

Create:

```text
Issue type: Epic
Summary: DOS Workflow Governance
Description:
Artifact ID: SYS-DOS-WORKFLOW
Truth Link: docs/superpowers/specs/2026-07-22-jira-operating-layer-design.md
Source ID: RULE-SRC-0001
Evidence Links: docs/game_design_archive/06_rule_sources/README.md
Decision Source: User approved Jira operating layer design on 2026-07-22.
```

Expected:

```text
One Epic exists and anchors Jira governance work.
```

- [ ] **Step 2: Create ID registry Gap**

Create:

```text
Issue type: Gap
Summary: Establish central ID and evidence registry
Description:
Artifact ID: GAP-ID-REGISTRY
Truth Link: docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md
Source ID: RULE-SRC-0003
Evidence Links: docs/game_design_archive/06_rule_sources/README.md
Decision Source: Workflow review section 3.7 marks ID/hash dedup as PENDING_ACTION.
```

Expected:

```text
One Gap issue records the missing ID/hash infrastructure.
```

- [ ] **Step 3: Create main workflow review Gap**

Create:

```text
Issue type: Gap
Summary: Define main workflow review mechanism
Description:
Artifact ID: GAP-MAIN-WORKFLOW-REVIEW
Truth Link: docs/game_design_archive/02_analysis/2026-07-22-workflow-system-review.md
Source ID: RULE-SRC-0002
Evidence Links: docs/game_design_archive/06_rule_sources/README.md
Decision Source: TempFolder adjudication is explicitly scoped out of main workflow review.
```

Expected:

```text
One Gap issue records the missing main workflow review mechanism.
```

## Task 6: Verify Configuration

- [ ] **Step 1: Check project identity**

Confirm:

```text
Project name is Design Operating System.
Project key is DOS or the recorded fallback key.
Project type is Team-managed Kanban.
```

- [ ] **Step 2: Check issue type coverage**

Confirm:

```text
Epic, Task, Bug, Decision, Research, Gap, Validation are available or documented fallback is active.
```

- [ ] **Step 3: Check field binding**

Confirm:

```text
Artifact ID, Truth Link, Source ID, Evidence Links, and Decision Source are available as fields or present in the Description template/block.
```

- [ ] **Step 4: Check state separation**

Confirm:

```text
Board columns are Jira action states, not archive document states.
```

- [ ] **Step 5: Final report**

Report:

```text
Project URL
Actual project key
Configured issue types
Configured fields or template fallback
Created seed issues
Any permission-limited items
```
