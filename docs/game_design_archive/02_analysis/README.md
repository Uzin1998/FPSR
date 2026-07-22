# Analysis Document Protocol

状态：`[LOCKED]`

规则来源：`RULE-SRC-0003 review-document-lifecycle`

本目录保存分析、评审、审查、复盘和裁决迁移报告。此类文档具有强时效性：它们可以在某一时间窗口内驱动修复和决策，但处理完后应转为历史证据，不应长期充当活跃工作台。

## 文档头字段

评审类文档建议使用以下头部字段：

```text
状态：[HYPOTHESIS] / [LOCKED] / ...
活跃性：[ACTIVE] / [CLOSED] / [SUPERSEDED] / [REFERENCE_ONLY]
活跃性规则来源：RULE-SRC-0003 review-document-lifecycle
归档时间：YYYY-MM-DD
审查窗口：
空间范围：
关闭时间：
关闭原因：
后继入口：
残留事项：
```

`状态` 仍然表示内容判断的成熟度。`活跃性` 只表示这份文档是否仍承担当前流程驱动职责。

## 活跃性枚举

```text
ACTIVE
  当前仍驱动待办、修复、裁决或决策。

CLOSED
  本轮审查已经处理完或完成迁移。
  文档保留为历史证据和定位入口，不再作为活跃工作台。

SUPERSEDED
  已被后续评审、规格或协议取代。
  引用时必须跳转到后继入口。

REFERENCE_ONLY
  仅作为背景材料或历史记录。
  从一开始就不承担行动义务。
```

## 条目处理状态

文档内部的单个问题、风险或建议可以使用独立处理状态：

```text
处理状态：PENDING_ACTION
处理状态：RESOLVED
处理状态：MIGRATED
处理状态：SUPERSEDED
处理状态：NO_ACTION
```

含义：

```text
PENDING_ACTION  仍需要处理。
RESOLVED        已处理，且处理证据写入本文或后继入口。
MIGRATED        已迁移到系统卡、缺口、冲突、测试或其他后继文档。
SUPERSEDED      被后续判断取代。
NO_ACTION       明确不需要执行动作，只保留记录。
```

## 禁止规则

1. 不用 `[LOCKED]` 表示“这份评审文档已不活跃”。
2. 不用 `[REJECTED]` 表示“这份评审文档已过期”。
3. 不让已关闭评审继续隐式驱动主工作流。
4. 不删除已关闭评审；必须保留关闭原因、后继入口和残留事项。
5. 不把评审文档的活跃性状态用于系统卡、对象卡或测试卡的设计成熟度。
