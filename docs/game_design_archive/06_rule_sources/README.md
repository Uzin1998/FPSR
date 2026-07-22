# Rule Sources Index

状态：`[LOCKED]`

本目录记录项目中出现的规则、流程门、状态语句、约束语句来自哪里。

目的：

```text
任何有具体含义的状态标注或约束语句，都必须能追溯到规则来源。
```

本目录不定义游戏设计本身，只记录规则来源和适用范围。

## 使用规则

1. 当文档中出现非 archive 状态机的状态语句时，必须记录来源。
2. 当外部 skill 的流程门影响文档处理时，必须记录来源。
3. 当一个规则只适用于某类文档时，必须写明非适用范围。
4. 禁止把外部流程门误并入游戏设计状态机。

## 当前规则来源

```text
RULE-SRC-0001 brainstorming-spec-review-gate
  来源：c:\Users\Admin\.trae-cn\skills\brainstorming\SKILL.md
  规则类型：外部 skill 流程门
  适用对象：docs/superpowers/specs 下由 brainstorming 产出的设计规格
  不适用对象：game_design_archive 的资料状态、游戏系统卡状态、UE 实现状态
  典型语句：状态：待用户书面复核 / 状态：已批准设计，待书面复核

RULE-SRC-0002 tempfolder-agent-output-adjudication
  来源：docs/superpowers/specs/2026-07-22-agent-output-adjudication-design.md
  执行计划：docs/superpowers/plans/2026-07-22-agent-output-adjudication.md
  本地入口：TempFolder/README.md
  规则类型：一次性局部裁决方案
  时间范围：2026-07-22 该轮 TempFolder 大模型输出审查任务
  空间范围：TempFolder/ 下七个模型目录及其裁判意见.md
  适用对象：TempFolder 内大模型讨论输出的法证式裁决
  不适用对象：game_design_archive 的主工作流资料摄取、主工作流评审、系统卡定型、测试闭环、UE 实现
  典型语句：裁判意见.md / 处理去向 / 直接继承 / 改写后继承 / 进入验证池

RULE-SRC-0003 review-document-lifecycle
  来源：docs/game_design_archive/02_analysis/README.md
  规则类型：评审文档时效性协议
  适用对象：docs/game_design_archive/02_analysis 下的评审、审查、复盘、裁决迁移报告
  不适用对象：系统卡、对象卡、体验锚点、关系边、测试卡的设计成熟度
  典型语句：活跃性：[ACTIVE] / [CLOSED] / [SUPERSEDED] / [REFERENCE_ONLY]
  条目语句：处理状态：PENDING_ACTION / RESOLVED / MIGRATED / SUPERSEDED / NO_ACTION

RULE-SRC-0004 jira-ai-control-boundary
  来源：docs/superpowers/specs/2026-07-22-jira-ai-control-design.md
  规则类型：Jira AI 控制面边界协议
  适用对象：本地 Jira REST CLI、AI 通过 CLI 对 Jira 执行读取或写入操作的流程
  不适用对象：Markdown/Git 真相源、game_design_archive 资料状态机、Jira 项目手工配置流程、MCP/webhook 接入方案
  典型语句：写操作默认 dry-run / --apply 显式写入 / archive 文档状态机不能写入 Jira workflow / 不保存 Jira token

RULE-SRC-0005 github-jira-dos-closed-loop-boundary
  来源：docs/superpowers/specs/2026-07-23-github-jira-dos-closed-loop-design.md
  规则类型：GitHub + Jira 闭环治理协议
  适用对象：Uzin1998/FPSR GitHub 仓库、DOS Jira 项目、本地 Git 初始化、PR 模板、CODEOWNERS、GitHub Actions governance check、Jira issue 的 GitHub evidence 绑定
  不适用对象：game_design_archive 资料状态机本身、游戏系统卡设计成熟度、UE 实现任务体系、GitHub Actions 写入 Jira 的深度自动化
  典型语句：GitHub/Git = Markdown 真相源与 PR 审查门 / Jira = 行动控制层 / PR 必须绑定 Jira Key / Jira Done 必须包含 GitHub PR 或 commit evidence / GitHub Issues 不作为权威任务系统
```

## 与 archive 状态机的边界

archive 状态机：

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

`待用户书面复核` 不属于 archive 状态机。它只表示 brainstorming skill 的设计文档审阅门：

```text
设计文档已写出
需要用户审阅
未进入 implementation plan
```

它不能用于描述游戏设计条目是否定型，也不能用于描述资料是否已查阅。

`ACTIVE / CLOSED / SUPERSEDED / REFERENCE_ONLY` 也不属于 archive 状态机。它们只表示评审类文档是否仍承担当前流程驱动职责：

```text
ACTIVE：仍在驱动修复或决策
CLOSED：本轮审查已处理完或完成迁移
SUPERSEDED：被后续文档取代
REFERENCE_ONLY：仅作背景材料
```

它们不能用于描述系统卡是否定型，也不能用于描述设计假设是否成立。

## 与 TempFolder 裁决方案的边界

`RULE-SRC-0002` 不定义主工作流裁决机制。

它只用于：

```text
审查 TempFolder 内已有的大模型讨论输出
生成七份 TempFolder/*/裁判意见.md
区分原模型观点、用户原话、裁判新增命题
避免重复副本被重复计权
```

它不能用于：

```text
处理新进入 inbox 的外部资料
决定系统卡是否定型
替代主工作流评审
替代测试闭环
指导 UE 实现
```

若主工作流需要评审机制，应另行设计，例如：

```text
inbox-review
design-reasoning
system-intake-review
```
