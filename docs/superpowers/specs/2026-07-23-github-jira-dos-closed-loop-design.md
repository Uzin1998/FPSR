# GitHub Jira DOS Closed Loop Design

日期：2026-07-23
状态：已批准设计，待实施计划
规则来源：RULE-SRC-0001 brainstorming-spec-review-gate；RULE-SRC-0005 github-jira-dos-closed-loop-boundary
上游规格：
- docs/superpowers/specs/2026-07-22-design-operating-system-v0.1-foundation-design.md
- docs/superpowers/specs/2026-07-22-design-operating-system-v0.2-governance-design.md
- docs/superpowers/specs/2026-07-22-jira-operating-layer-design.md
- docs/superpowers/specs/2026-07-22-jira-ai-control-design.md

## 1. 背景

当前 DOS 已有本地 Markdown 资料、Jira 操作层规格和本地 Jira REST CLI。

当前外部平台状态：

```text
GitHub 仓库：Uzin1998/FPSR
GitHub 仓库状态：空仓库
Jira 项目：DOS
已观测 Jira issue：DOS-1
本地工作目录：e:\System
本地 Git 状态：尚未初始化为 Git 仓库
```

本规格定义 GitHub + Jira 的闭环边界：

```text
GitHub/Git = Markdown 真相源、版本历史、PR 审查门、CI 证据
Jira = 行动控制层、排期、阻塞、Review、Done 判定
```

Jira 不替代 Markdown/Git。GitHub Issues 不替代 Jira。

## 2. 目标

建立一个规则强制的 DOS 工作闭环，使每次设计、规则、工具或测试变更都能被追溯：

```text
Jira Issue
-> Git branch
-> Git commit
-> GitHub PR
-> CI governance check
-> Markdown / tool / test change
-> GitHub merged state
-> Jira Done evidence
```

闭环必须满足：

```text
1. 设计真相进入 GitHub 仓库，而不是留在本地临时目录。
2. 行动状态留在 Jira，而不是写入 Markdown 文档状态机。
3. PR 不能缺 Jira Key。
4. 设计文档不能缺 Artifact ID、Source ID 或 Rule Source 追踪。
5. Jira Done 不能缺 GitHub PR/commit 证据。
6. GitHub CI 必须阻止明显违反 DOS 治理规则的 PR 合并。
```

## 3. 非目标

本阶段不做：

```text
1. 不建立 GitHub Actions 到 Jira 的写入型自动化。
2. 不配置 Jira webhook。
3. 不在 GitHub Secrets 中保存 Jira token。
4. 不让 GitHub Issue 承担任务管理。
5. 不让 Jira issue description 承担设计真相源。
6. 不把 Jira workflow 状态写入 archive 文档状态机。
7. 不把 archive 文档状态写入 Jira workflow。
8. 不迁移到 UE 实现任务体系。
```

这些非目标的原因：

```text
当前最关键缺口不是平台联动深度，而是规则强制、证据闭环和真相源唯一性。
写入型自动化会过早引入 token、权限、webhook、状态同步和失败重试复杂度。
```

## 4. 权威边界

### 4.1 Markdown / Git 权威

Markdown/Git 负责：

```text
规范正文
设计卡片
规则来源索引
源资料 custody
测试定义
测试报告
工具脚本
变更历史
```

Git commit 和 GitHub PR 只证明“某次变更发生并被审查”。它们不自动证明设计正确。

### 4.2 GitHub 权威

GitHub 负责：

```text
远端仓库
PR 审查
分支保护
CI 规则校验
merge 记录
permalink 证据
```

GitHub Issues 默认不使用。若仓库无法关闭 Issues，则 README 或仓库说明必须声明：

```text
Issues are tracked in Jira DOS. GitHub Issues are not the authoritative task system.
```

### 4.3 Jira 权威

Jira 负责：

```text
行动拆分
优先级
负责人
当前执行状态
阻塞记录
Review 状态
Done 判定
```

Jira 不负责：

```text
保存规范正文
覆盖 Git 历史
定义 archive 文档状态
替代 Rule Sources Index
```

## 5. GitHub 仓库配置

目标仓库：

```text
https://github.com/Uzin1998/FPSR
```

本地初始化后使用：

```text
默认分支：main
远端名：origin
远端地址：https://github.com/Uzin1998/FPSR.git
```

必须纳入版本控制的目录：

```text
docs/
tools/
tests/
.github/
```

默认不纳入版本控制的内容：

```text
真实 Jira token
本地环境变量文件
编辑器缓存
临时浏览器状态
构建产物
```

`TempFolder/` 的处理方式：

```text
短期可以保留并提交为历史审查证据。
长期应迁移到 docs/game_design_archive/00_raw_sources 或 docs/game_design_archive/02_analysis。
任何迁移都必须保留 Source ID 和 manifest。
```

## 6. 分支、Commit、PR 规则

### 6.1 分支命名

所有工作分支必须绑定 Jira Key：

```text
docs/DOS-123-short-topic
tools/DOS-123-short-topic
tests/DOS-123-short-topic
governance/DOS-123-short-topic
```

允许的 Jira Key 形式：

```text
DOS-\d+
```

如果未来 Jira 项目 key 改为 `GDOS`，必须先更新本规格和 CI 规则来源，再允许：

```text
GDOS-\d+
```

### 6.2 Commit message

Commit message 第一行必须包含 Jira Key：

```text
DOS-123: add GitHub governance check
```

不允许：

```text
update docs
fix stuff
misc
```

### 6.3 PR 标题

PR 标题必须包含 Jira Key：

```text
DOS-123: establish GitHub governance checks
```

### 6.4 PR 正文

PR 正文必须包含：

```text
Jira Issue:
Artifact IDs:
Source IDs:
Rule Sources:
Truth Links:
Evidence:
Done Check:
```

如果某项不适用，必须写明：

```text
N/A - no artifact changed
N/A - no external source involved
N/A - no new rule/status statement introduced
```

禁止留空。

## 7. GitHub 强制门

### 7.1 分支保护

`main` 必须配置：

```text
Require a pull request before merging
Require status checks to pass before merging
Require branches to be up to date before merging
Require conversation resolution before merging
Block force pushes
Block deletions
```

如果 GitHub 免费计划或权限限制导致某项不可配置，必须记录在 Jira issue 的 Evidence Links 中。

### 7.2 CODEOWNERS

第一版 CODEOWNERS 使用单一所有者：

```text
* @Uzin1998
```

后续若加入协作者，再按目录拆分：

```text
docs/game_design_archive/ @Uzin1998
docs/superpowers/ @Uzin1998
tools/ @Uzin1998
tests/ @Uzin1998
.github/ @Uzin1998
```

### 7.3 PR 模板

GitHub PR 模板必须强制作者填写 DOS 追踪块。

最小模板字段：

```text
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

### 7.4 CI Governance Check

CI 必须至少检查：

```text
1. PR 标题或正文包含 DOS-\d+。
2. PR 正文包含 Jira Issue 字段。
3. PR 正文包含 Truth Links 字段。
4. 修改 docs/superpowers/specs 时，文档头部包含规则来源。
5. 修改 docs/game_design_archive/06_rule_sources 时，不删除已有 RULE-SRC 条目。
6. 文档中不得把 archive 状态写成 Jira workflow 状态。
7. Jira workflow 状态不得包含 archive 状态机。
8. tools/jira_ai_control.js 的测试必须通过。
```

CI 第一版不调用 Jira API。

## 8. Jira 配置补充

Jira 已有操作层规格，本闭环只补充 GitHub 证据要求。

每个 Jira issue 的 DOS 绑定块增加：

```text
GitHub PR:
Git Commit:
GitHub Evidence:
```

完整 Description 建议：

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

Jira `Done` 前必须检查：

```text
1. 对应 PR 已 merge，或明确记录无仓库变更。
2. 对应 commit 可在 GitHub 查看。
3. PR CI 通过。
4. Truth Link 指向仓库路径或 GitHub permalink。
5. 若变更规则、状态、流程门，Rule Sources Index 已更新。
```

## 9. 状态机隔离

Jira workflow 只允许：

```text
Backlog
Ready
In Progress
Blocked
Review
Done
```

archive 文档状态机只允许：

```text
[UNREAD]
[TRIAGED]
[OPEN]
[HYPOTHESIS]
[TESTING]
[LOCKED]
[REWORK]
[REJECTED]
```

禁止：

```text
1. 把 [LOCKED] 当作 Jira Done。
2. 把 Jira Review 写成设计卡验证状态。
3. 把 Jira Blocked 写入 archive 文档状态字段。
4. 用 GitHub merge 代替设计定型。
```

## 10. Traceability Contract

每次闭环变更必须能回答：

```text
哪个 Jira issue 驱动了这次行动？
哪个 PR 审查了这次变更？
哪个 commit 记录了最终内容？
哪个 Markdown 文档是语义真相？
哪个 Artifact ID / Source ID 被影响？
哪个 Rule Source 支撑新增规则语句？
哪些测试或人工证据支持 Done？
```

最低可接受证据链：

```text
Jira DOS-123
-> branch docs/DOS-123-topic
-> commit DOS-123: concise summary
-> PR DOS-123: concise summary
-> CI passed
-> docs/... path or GitHub permalink
-> Jira Done evidence links
```

## 11. 错误处理

### 11.1 PR 缺 Jira Key

处理：

```text
CI fail。
PR 不允许 merge。
作者补充 Jira Key 后重新运行 CI。
```

### 11.2 文档新增规则但未登记 Rule Source

处理：

```text
CI fail 或 Review 阻断。
必须更新 docs/game_design_archive/06_rule_sources/README.md。
```

### 11.3 Jira issue 进入 Done 但 PR 未 merge

处理：

```text
该 Done 判定无效。
将 Jira issue 退回 Review 或 In Progress。
补充 GitHub PR / commit 证据。
```

### 11.4 GitHub 仓库配置受权限限制

处理：

```text
记录缺失配置项。
创建 Jira Gap。
不得把权限限制伪装成配置完成。
```

## 12. 安全规则

```text
1. 不提交 .env。
2. 不提交 jira_ai_control.env 的真实副本。
3. 不在 GitHub Actions 日志中打印 Jira token。
4. 第一版 CI 不读取 Jira token。
5. 未来如需 Jira API 自动化，只能使用 GitHub Secrets。
6. GitHub Secrets 名称必须记录在规格中，但密钥值不得记录。
```

## 13. 验收标准

本闭环完成的最低验收：

```text
1. e:\System 初始化为 Git 仓库。
2. origin 指向 https://github.com/Uzin1998/FPSR.git。
3. main 分支内容成功推送到 GitHub。
4. GitHub main 分支保护启用。
5. GitHub PR 模板存在。
6. CODEOWNERS 存在。
7. GitHub Actions governance check 存在。
8. governance check 能阻止缺 Jira Key 的 PR。
9. governance check 能运行现有 Jira CLI 单元测试。
10. Jira issue Description 模板包含 GitHub PR / Git Commit / GitHub Evidence。
11. 至少一个 Jira issue 记录了对应 GitHub PR 或明确记录无仓库变更。
12. Rule Sources Index 登记 RULE-SRC-0005。
```

## 14. 第一批实施任务

第一批实施只覆盖规则强制闭环：

```text
1. 初始化本地 Git 仓库并连接 Uzin1998/FPSR。
2. 添加 .gitignore，保护 token 和本地环境文件。
3. 添加 GitHub PR 模板。
4. 添加 CODEOWNERS。
5. 添加 GitHub Actions workflow。
6. 添加 DOS governance check 脚本和测试。
7. 更新 Jira issue description 模板或 DOS 操作规则 issue。
8. 创建一个验证 PR，证明 CI 能拦截错误并通过正确格式。
```

不在第一批实施中做：

```text
GitHub Actions 写 Jira
Jira webhook
自动流转 Jira 状态
自动关闭 Jira issue
跨项目同步
```

## 15. 后续升级门槛

只有当以下条件满足后，才允许进入深度联动：

```text
1. 至少 5 个 PR 通过规则强制闭环。
2. 至少 3 个 Jira issue 按 GitHub evidence 完成 Done。
3. CI 误报和漏报已记录并修正。
4. Rule Sources Index 没有悬空规则来源。
5. 用户确认 Jira 与 GitHub 的边界没有被流程压力破坏。
```

深度联动可以评估：

```text
GitHub Actions 评论 Jira issue
GitHub merge 后自动追加 Jira evidence
Jira issue 状态到 PR checklist 的只读映射
```

即使进入深度联动，仍不得让自动化直接修改 Markdown 真相源。
