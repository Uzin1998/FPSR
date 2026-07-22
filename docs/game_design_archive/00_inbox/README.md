# Inbox Protocol

状态：`[LOCKED]`

本目录只放尚未处理的新资料工作入口。它不是原始源文件副本库、设计定稿区，也不是系统规格区。

原始源文件副本必须先保存在 `../00_raw_sources/`。本目录可以保存源文件索引、转写版、摘要、拆分任务或人工录入内容。

## 新资料格式

文件名：

```text
YYYY-MM-DD-来源-主题.md
```

示例：

```text
2026-07-22-user-material-resource-economy.md
2026-07-22-user-material-room-flow.md
2026-07-22-user-material-random-system.md
```

文件头：

```text
状态：[UNREAD]
加入时间：YYYY-MM-DD HH:mm
来源：用户 / AI / 外部资料 / 测试结果
关联批次：BATCH-0001
关联源文件：SRC-0001 / 多个 / 无
主题：
处理去向：
```

## 查阅后处理

查阅后不直接删除原文。按下面方式处理：

```text
[UNREAD]  -> [TRIAGED]
```

`[TRIAGED]` 只表示已经查阅并拆分。

同时在原文件头更新处理去向：

```text
处理去向：
- [OPEN] ...
- [HYPOTHESIS] ...
- [TESTING] ...
- [LOCKED] ...
- [REWORK] ...
- [REJECTED] ...
- 04_axioms_and_constraints/...
- 05_models/...
- 03_system_registry/...
```

允许的处理去向包括：

```text
系统卡 / 对象卡 / 体验锚点 / 关系边 / 测试定义
缺口 / 冲突 / 验证池 / 拒绝记录 / 仅保留为讨论史
```

## 禁止规则

1. 不把 `[UNREAD]` 内容直接当成定型设计。
2. 不在 inbox 里做最终系统推导。
3. 不让新资料覆盖已有 `[LOCKED]` 内容，除非显式标记为 `[REWORK]`。
4. 不混合“原始想法”和“AI 推导结论”。
5. 不把 inbox 工作副本当作 raw source；需要原始证据时必须回到 `00_raw_sources/`。
