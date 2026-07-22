# 设计操作系统 v0.4.1 规格方案

日期：2026-07-22  
状态：待用户书面复核
规则来源：RULE-SRC-0001 brainstorming-spec-review-gate

## 1. 目标

v0.4.1 的目标是把 v0.3 的卡片规范推进成可机器投影的规格体系，使规范文档、结构化规格、测试模块和未来代码骨架之间形成可追踪闭环。

v0.3 规格文件：

```text
docs/superpowers/specs/2026-07-22-design-operating-system-v0.3-card-schema-design.md
```

v0.4.1 相对 v0.4 增加一项补丁：源文件副本必须进入不可变 raw source custody 层，inbox 只作为待处理工作入口。

本阶段不设计具体游戏机制，不进入 UE 实现，不编写测试代码。只定义文档如何被结构化、如何校准、如何被测试读取。

核心原则：

```text
Markdown 正文 = 语义说明、推理、边界、证据
YAML Front Matter = 机器可读字段
校准记录 = 证明 YAML 没有偏离 Markdown
测试模块 = 只读取已校准 YAML
```

## 2. 现有目录兼容

v0.4.1 接入已有 `docs/game_design_archive/`，不另起一套资料系统。

已有目录职责保持不变：

```text
00_raw_sources/
  原始源文件副本库。保存喂入资料的不可变副本、批次 manifest 和 SHA-256。

00_inbox/
  新增资料工作入口。只放未查阅、未拆分的索引、转写版、摘要或拆分任务。

01_conversation_archive/
  对话记录、原始想法摘录、上下文来源。

02_analysis/
  已分析内容，包括核心判断、风险、不合理点、修改办法、拓展方向。

03_system_registry/
  系统清单、系统状态、依赖关系、待设计接口。

04_axioms_and_constraints/
  已定型原则、硬约束、禁止项、设计钉子。

05_models/
  逻辑模型、数据模型、关系图模型、概率模型、测试模型。
```

v0.4.1 只补充以下未来落点：

```text
03_system_registry/
  systems/
  objects/
  anchors/
  tests/
  edges/
  gaps.md
  conflicts.md

05_models/
  structured_specs/
  calibration_reports/
  simulation_reports/
```

这些目录是建议落点，不要求本阶段立即创建。

## 3. 源文件副本保全

任何喂入资料在进入 inbox 前，必须先判断是否需要保存源文件副本。

需要保存源文件副本的资料包括：

```text
用户上传或粘贴的原始文档
外部资料
模型输出文件
PDF、图片、音频、压缩包
测试结果原始导出
任何后续可能需要证明来源的资料
```

源文件副本保存到：

```text
docs/game_design_archive/00_raw_sources/BATCH-0001/files/
```

每个批次必须有：

```text
manifest.md
```

manifest 至少记录：

```text
批次ID
加入时间
来源
资料类型
文件清单
SRC-* ID
原始文件名
保存路径
SHA-256
是否已建立 inbox 条目
关联 inbox
```

规则：

- `00_raw_sources/` 只增不改。
- 源文件副本永不编辑。
- 清洗、转写、摘要、拆分任务进入 `00_inbox/` 或后续分析区。
- 卡片 `sources` 优先引用 `BATCH-*` / `SRC-*` / `REPORT-*`。
- 没有 hash 的资料不能作为定型证据。
- raw source 不能直接进入定型规范，必须经过 inbox 查阅和拆分。

## 4. 规格形态

每张规范卡使用 Markdown 文件承载语义正文，并在文件头使用 YAML Front Matter 承载机器可读投影。

示例：

```markdown
---
id: SYS-0001
card_type: system_contract
name: 资源价值系统
responsibility_faces: [R0, R1, R3]
status: HYPOTHESIS
version: 0.1.0
sources: [BATCH-0001]
depends_on: []
gaps: [GAP-0001]
conflicts: []
projection_status: drafted
verification_status: none
calibration:
  status: uncalibrated
  calibrated_by:
  calibrated_at:
  source_markdown_version:
  projected_yaml_version:
  mapping_notes:
  uncertain_fields: []
  rejected_fields: []
---

# SYS-0001 资源价值系统

## 目的

资源的价值定义为它对玩家未来行动集合的改变。

## 输入

...

## 输出

...

## 硬约束

...

## 反模式

...
```

## 5. 卡片类型

v0.4.1 继承 v0.3 的五类核心卡：

```text
system_contract   系统契约卡
object_spec       对象规格卡
experience_anchor 体验锚点卡
test_definition   测试定义卡
relation_edge     关系边卡
```

所有卡共享以下元字段：

```yaml
id:
card_type:
name:
responsibility_faces:
status:
version:
sources:
depends_on:
gaps:
conflicts:
projection_status:
verification_status:
calibration:
  status:
  calibrated_by:
  calibrated_at:
  source_markdown_version:
  projected_yaml_version:
  mapping_notes:
  uncertain_fields:
  rejected_fields:
```

规则：

- `id` 永不复用。
- `name` 可改，`id` 不改。
- `sources` 必须引用资料批次、源文件、裁决文件、用户明确指令或测试报告。
- `depends_on` 只引用稳定 ID，不引用自然语言标题。
- 未知内容必须显式写 `UNKNOWN`、`TBD` 或 `N/A`。
- `UNKNOWN` 和 `TBD` 必须进入 `gaps`。
- 已知冲突必须进入 `conflicts`。

## 6. 状态兼容

v0.4.1 沿用现有 archive 状态，不创建第二套顶层状态机。

顶层状态：

```text
[UNREAD]     新加入，尚未查阅。只用于 inbox 工作入口。
[TRIAGED]    已查阅，已拆分。
[OPEN]       未定型，可继续发散。
[HYPOTHESIS] 有设计假设，需要论证或验证。
[TESTING]    需要仿真、样本统计或玩法验证。
[LOCKED]     已定型，默认不随意修改。
[REWORK]     已发现问题，需要返工。
[REJECTED]   明确废弃。
```

说明：方括号是 Markdown 正文中的人类可读标记；YAML 中使用不带方括号的枚举值，例如 `HYPOTHESIS`。

v0.2 中更细的结构化和验证状态不作为顶层状态，而是进入卡片字段：

```text
docs/superpowers/specs/2026-07-22-design-operating-system-v0.2-governance-design.md
```

```yaml
projection_status: missing | drafted | calibrated
verification_status: none | pending | running | passed | failed
```

这样可以同时保留人类可读状态和机器流程状态。

## 7. YAML 投影规则

YAML Front Matter 是机器投影，不是新的真相源。

投影必须满足：

- 每个 YAML 关键字段都能在 Markdown 正文找到语义依据。
- YAML 不得引入 Markdown 正文没有声明的新规则。
- YAML 可以压缩表达，但不能改变含义。
- YAML 中的枚举值必须来自规格允许列表。
- YAML 中的 ID 引用必须存在，或进入缺口队列。
- YAML 的 `version` 必须与校准记录和测试读取版本一致。

允许 YAML 表达：

- 卡片身份。
- 责任面。
- 状态。
- 依赖。
- 缺口。
- 冲突。
- 测试引用。
- 结构化参数。
- 枚举标签。

禁止 YAML 表达：

- Markdown 正文没有定义的隐式规则。
- 未经校准的 AI 补全。
- 未经裁决的冲突覆盖。
- 对体验目标的伪数学替换。

## 8. 校准协议

结构化投影不能自动生效。卡片进入测试前必须完成校准。

校准记录至少包含：

```yaml
calibration:
  status: uncalibrated | calibrated | rejected
  calibrated_by:
  calibrated_at:
  source_markdown_version:
  projected_yaml_version:
  mapping_notes:
  uncertain_fields:
  rejected_fields:
```

校准检查：

1. YAML 字段完整，不允许关键字段缺失。
2. Markdown 正文能解释 YAML 的每个关键字段。
3. `UNKNOWN` / `TBD` 已进入 `gaps`。
4. 冲突已进入 `conflicts`。
5. `calibration.status = calibrated`。
6. 测试读取的版本与校准版本一致。

校准失败时：

- 不允许进入测试。
- 生成缺口或冲突记录。
- 不修改原始资料。
- 不自动覆盖 Markdown 正文。

## 9. 缺口与冲突

缺口和冲突分开管理。

缺口表示信息不足、字段未知、需要推理或测试：

```text
GAP-0001
来源卡片：
字段：
缺口类型：用户决策 / AI 推理 / 仿真验证 / 资料补充 / 工程验证
阻塞范围：
关闭条件：
```

冲突表示两个或多个来源之间存在不兼容判断：

```text
CONFLICT-0001
冲突双方：
来源：
冲突类型：定义冲突 / 规则冲突 / 数据冲突 / 验证冲突 / 优先级冲突
影响范围：
临时处理方式：
裁决人：
关闭条件：
```

冲突逐案裁决，不设置自动覆盖优先级。

## 10. 测试读取门槛

测试模块只能读取满足以下条件的卡片：

```text
projection_status = calibrated
calibration.status = calibrated
verification_status in [none, pending, failed]
status in [HYPOTHESIS, TESTING, LOCKED, REWORK]
```

测试模块不能读取：

- `[UNREAD]` inbox 工作入口。
- `[TRIAGED]` 但尚未成卡的资料。
- `00_raw_sources/` 中的源文件副本。
- `projection_status = missing` 的卡片。
- `calibration.status = uncalibrated` 的卡片。
- 含有未登记冲突的卡片。

测试模块输出只能是：

```text
通过/失败/异常
指标报告
失败证据
疑似责任面
禁止修复方式
建议补丁
候选参数
返工建议
```

测试模块不得直接修改规范文档或 YAML 投影。

## 11. 最小闭环

v0.4.1 定义的最小闭环：

```text
原始资料
-> 00_raw_sources 源文件副本
-> 00_inbox 工作入口
-> 查阅拆分
-> 卡片 Markdown
-> YAML Front Matter 投影
-> 语义校准
-> 结构化规格汇总
-> 测试定义读取
-> 测试报告
-> gap/conflict/rework
```

闭环验收：

- 原始资料可追溯。
- 源文件副本有 `BATCH-*` / `SRC-*` 和 SHA-256。
- 卡片有稳定 ID。
- YAML 字段有 Markdown 依据。
- 测试读取的是已校准版本。
- 测试失败不会直接调参。
- 返工回到规范文档。

## 12. 设计边界

v0.4.1 不解决：

- 具体资源经济系统如何设计。
- 随机概率系统的具体分布。
- 房间推进机制。
- 海量脆皮怪的玩法归属。
- UE 数据资产结构。
- 模拟器代码结构。

v0.4.1 只解决：

- 规范如何被机器读取。
- 机器读取前如何校准。
- 测试如何合法读取规格。
- 缺口和冲突如何回流。

## 13. 后续阶段

v0.5 建议目标：定义第一批可运行测试模块的规格格式。

候选内容：

- 结构一致性测试规格。
- 概率统计测试规格。
- 资源流/经济测试规格。
- 反模式检测规格。
- 测试报告格式。
- 报告到缺口/冲突/返工的映射规则。

v0.5 仍不进入 UE 实现。

## 14. 已知限制

- 当前工作区不是 Git 仓库，无法提交规格文档；本阶段只能写入文件并保留路径。
- YAML Front Matter 适合早期机器投影，但当结构化字段变复杂时，可能需要独立 JSON/YAML 汇总文件。
- 校准流程会增加前置成本，但这是防止文档和机器规格漂移的必要成本。
- 本规格只定义协议，不保证任何具体游戏系统已经成立。
