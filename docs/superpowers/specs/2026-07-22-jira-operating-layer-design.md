# Jira Operating Layer Design

日期：2026-07-22  
状态：待用户书面复核  
规则来源：RULE-SRC-0001 brainstorming-spec-review-gate

## 1. 目标

为当前游戏设计操作系统接入一个新的 Jira Software 项目，使 Jira 承担执行控制层职责。

Jira 只管理行动、排期、阻塞、审查和完成判定；Markdown/Git 仍然是设计真相源。

## 2. 推荐配置

```text
Jira 产品：Jira Software
项目类型：Team-managed project
项目模板：Kanban
项目名：Design Operating System
项目 key：DOS
```

选择 Team-managed 的原因：

```text
1. 配置局部化，不污染全站 issue type / field / workflow scheme。
2. 适合 DOS 当前试运行阶段。
3. 可以快速验证 Artifact ID、Truth Link 和 Done 准则是否足够。
```

## 3. Issue 类型

项目内需要配置以下 Issue 类型：

```text
Epic        系统域或长期设计域，例如资源价值系统、房间系统、资料摄取系统。
Task        明确执行动作，例如创建卡片、补齐字段、跑一次校准。
Decision    设计裁决，必须绑定来源和影响范围。
Research    调研或资料查证任务。
Bug         已定义规则被违反时使用，不用于“缺信息”。
Gap         缺失项、未知字段、待补证据、待用户决策。
Validation  仿真、测试、样本统计或规则校验任务。
```

边界：

```text
Bug = 错，表示已有规则被违反。
Gap = 缺，表示缺信息、缺证据、缺决策或缺实现。
Decision = 裁决，不等于执行完成。
Validation = 验证动作，不等于设计定型。
```

## 4. 工作流状态

Kanban 列建议配置为：

```text
Backlog
Ready
In Progress
Blocked
Review
Done
```

这些状态只描述 Jira 行动流，不描述 archive 文档状态。

禁止把以下状态搬进 Jira workflow：

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

这些状态属于 `docs/game_design_archive` 的设计/资料状态机。

## 5. 字段

项目字段按优先级配置：

```text
Artifact ID
  类型：Short text
  目的：绑定 SYS-* / OBJ-* / ANCHOR-* / TEST-* / EDGE-* / GAP-* / CONFLICT-*。

Truth Link
  类型：URL 或 Paragraph
  目的：指向 Markdown 真相源路径或仓库链接。

Source ID
  类型：Short text
  目的：绑定 BATCH-* / SRC-* / REPORT-* / RULE-SRC-*。

Evidence Links
  类型：Paragraph
  目的：记录证据链接、测试报告、相关 source、对话归档。

Decision Source
  类型：Paragraph
  目的：记录裁决依据，主要用于 Decision / Bug / Gap。
```

如果 Jira 当前权限不允许创建必填字段，则先把这些字段写入 Issue Description 模板，不阻塞项目创建。

## 6. Done 准则

Jira issue 进入 `Done` 前必须满足：

```text
1. 对应 Markdown 文档已更新，或明确记录“不需要文档变更”的理由。
2. Artifact ID 或 Source ID 已绑定。
3. Truth Link 指向可追踪位置。
4. Decision / Bug / Gap / Validation 有证据链接。
5. 无悬空引用：被引用的 SYS-* / SRC-* / RULE-SRC-* 等 ID 能找到来源。
6. 若产生规则或状态语句，已登记或引用 Rule Source。
```

## 7. 初始 Epic 建议

新项目创建后建议先建立这些 Epic：

```text
DOS Workflow Governance
Raw Source Custody
Main Workflow Review
Production Intake Package
ID And Evidence Registry
Resource Value System Trial
```

这些 Epic 对应当前已知缺口：

```text
主工作流评审机制未建立
Production Intake Package 未建立
中央 ID / hash 去重索引未建立
资源价值系统尚未试跑完整链路
```

## 8. 验收

本次 Jira 接入完成的最低验收：

```text
1. 新 Jira Kanban 项目已创建。
2. 项目名和 key 符合 DOS 命名。
3. Issue 类型至少覆盖 Epic / Task / Bug / Gap / Decision / Research / Validation。
4. Kanban 列至少覆盖 Backlog / Ready / In Progress / Blocked / Review / Done。
5. Artifact ID、Truth Link、Source ID 的绑定方式已可执行。
6. 至少创建一个初始 Epic，用于承载 DOS 工作流治理。
```

## 9. 非目标

本次不做：

```text
1. 不迁移 Markdown 真相源到 Jira。
2. 不把 Jira 当作设计文档仓库。
3. 不把 Jira 状态和 archive 状态机合并。
4. 不建立 UE 实现任务体系。
5. 不接入自动化 API 或 webhook。
```
