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
