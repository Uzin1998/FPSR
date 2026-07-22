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
