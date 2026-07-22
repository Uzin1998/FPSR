# 设计操作系统与工作流评审归档

状态：[LOCKED]
状态说明：本文作为历史评审记录已完成归档；不表示后继系统、卡片、测试或 UE 实现已经完成。
活跃性：[CLOSED]
活跃性规则来源：RULE-SRC-0003 review-document-lifecycle
归档时间：2026-07-22
来源：当前对话中的工作流评审
归档类型：流程评审 / 系统审查
审查窗口：2026-07-22 当前工作流审查
空间范围：docs/game_design_archive、docs/superpowers/specs、game-design-ingest skill、TempFolder 裁决引用
关闭时间：2026-07-22 17:11
关闭原因：本轮审查已经完成记录和状态校准；已处理项写入修订记录；未完成项保留为残留事项和后继入口，不再在本文件继续展开。
处理去向：

## 1. 评审范围

本次评审检查当前游戏设计资料系统是否能形成稳定生产链路。

重点检查四条链：

```text
资料证据链
分析评审链
规范生产链
测试到实现链
```

检查对象：

```text
docs/game_design_archive/README.md
docs/game_design_archive/00_raw_sources/README.md
docs/game_design_archive/00_inbox/README.md
docs/superpowers/specs/2026-07-22-design-operating-system-v0.4-design.md
docs/superpowers/specs/2026-07-22-design-operating-system-v0.5-test-loop-design.md
.trae/skills/game-design-ingest/SKILL.md
```

本归档记录评审结果和后续修订证据。关闭后不再作为活跃工作台；后续工作应进入对应后继入口。

## 2. 总体结论

当前系统是“治理原型”，还不是持续运行的游戏设计生产系统。

直接拖入 Markdown 资料可以被摄取，但不能保证最终影响游戏设计实现。

当前成熟度：

```text
证据保全协议：已设计，已试运行 BATCH-0001 / BATCH-0002
局部裁判任务：已按 RULE-SRC-0002 在 TempFolder 内成功运行一次，不属于主工作流评审
持续摄取：部分可用
规范生产入库：未运行
结构化校准：仅有规格
测试闭环：仅有规格
代码/UE实现：未开始
```

核心断点不是目录混乱，而是主工作流尚未定义自己的评审、推理和入库机制。

## 3. 主要问题

### 3.1 [高][错][已修正] 旧“吸收”概念污染状态模型

处理状态：`RESOLVED`

旧协议曾试图让 `[TRIAGED]` 与“资料是否进入系统”发生关系，并额外引入吸收程度字段。

复盘后判断：

```text
“吸收”是伪概念，不应作为工作流状态或百分比字段存在。
```

正确边界：

```text
[TRIAGED] 只表示入口资料已查阅、已拆分。
拆分后产生的具体产物各自进入：
[OPEN] / [HYPOTHESIS] / [TESTING] / [LOCKED] / [REWORK] / [REJECTED]
```

后果：

```text
如果保留“吸收”轴，会制造无法验证的中间状态，并与已有状态机重复。
```

建议：

```text
删除所有“吸收状态 / 吸收进度 / 是否已吸收进系统”字段。
inbox 只记录处理去向，不记录吸收程度。
```

### 3.2 [中][错][已修正] `待用户书面复核` 曾缺少规则来源

处理状态：`RESOLVED`

v0.4.1 和 v0.5 均标记为：

```text
状态：待用户书面复核
```

该状态来自 brainstorming skill 的规格审阅流程门，但最初没有在项目内记录规则来源。

证据：

```text
docs/superpowers/specs/2026-07-22-design-operating-system-v0.4-design.md
docs/superpowers/specs/2026-07-22-design-operating-system-v0.5-test-loop-design.md
.trae/skills/game-design-ingest/SKILL.md
```

后果：

```text
后续 agent 无法判断该状态属于 archive 状态机、游戏设计状态，还是外部流程门。
```

建议：

```text
建立规则来源索引，记录该状态来自 brainstorming skill。
明确其只适用于 docs/superpowers/specs 下由 brainstorming 产出的设计规格。
明确其不属于 archive 状态机。
```

当前处理：

```text
已新增 docs/game_design_archive/06_rule_sources/README.md
已登记 RULE-SRC-0001 brainstorming-spec-review-gate
已在相关 specs 文件头加入规则来源字段
```

### 3.3 [高][缺] 没有持久化的“生产入库事务”

处理状态：`PENDING_ACTION`

`game-design-ingest` 要求输出六类拆分，但没有强制生成生产文件：

```text
02_analysis/BATCH-xxxx-triage.md
03_system_registry/BATCH-xxxx-registry-delta.md
03_system_registry/systems/*.md
03_system_registry/objects/*.md
03_system_registry/anchors/*.md
03_system_registry/edges/*.md
03_system_registry/gaps.md
03_system_registry/conflicts.md
```

最新检查：

```text
00_raw_sources: 已有 BATCH-0001 / BATCH-0002 raw source 试运行
00_inbox: 已有 BATCH-0001 / BATCH-0002 对应 [UNREAD] 工作入口
01_conversation_archive: 0 production files
02_analysis: 0 production files before this archive
03_system_registry: 0 production files
04_axioms_and_constraints: 0 production files
```

后果：

```text
raw source 和 inbox 已经发生状态变化，但仍没有“从 inbox 到系统注册表/卡片/缺口/冲突”的生产入库事务。
```

建议：

```text
定义“Production Intake Package”：
- triage report
- main-workflow review report
- registry delta
- candidate cards
- gap/conflict delta
```

### 3.4 [高][错][已修正] 将 TempFolder 专用裁决误当成主工作流裁决门

处理状态：`RESOLVED`

旧评审曾将 `docs/superpowers/specs/2026-07-22-agent-output-adjudication-design.md` 视为主工作流中摄取资料后的必经裁决机制。

复盘后判断：

```text
这是作用域误判。
该裁决方案只服务 TempFolder 内大模型讨论输出审查，不应作为主工作流的通用裁决门。
规则来源：RULE-SRC-0002 tempfolder-agent-output-adjudication。
```

真正的问题是：

```text
主工作流尚未定义自己的评审和推理机制。
game-design-ingest 作为外部资料引入器，不应承担该机制。
```

后果：

```text
如果复用 TempFolder 裁决方案，会把一次性审查流程错误固化为主工作流基础设施。
```

建议：

```text
撤销“摄取与 TempFolder 裁决没有连接”的问题定义。
后续如需要，应另行设计主工作流评审机制，例如 inbox-review / design-reasoning / system-intake-review。
```

当前处理：

```text
已登记 RULE-SRC-0002。
已为 TempFolder/README.md、TempFolder/*/裁判意见.md、裁决 spec 和 plan 补充规则来源与作用域。
主工作流评审机制仍未建立，另列为 PENDING_ACTION。
```

### 3.4b [中][错][已修正] game-design-ingest 存在卡片候选越界措辞

处理状态：`RESOLVED`

`game-design-ingest` 曾输出：

```text
可沉淀条目
ANCHOR-* / SYS-* / OBJ-* / EDGE-* / TEST-* / PATCH-* 候选
card drafting / registry update
```

这不等于它实际修改了 registry 或创建了卡片，但语言上越过了“外部资料引入器”的边界。

后果：

```text
后续 agent 可能把 inbox triage 误当成卡片候选生成步骤。
```

建议：

```text
ingest skill 只输出事实、推导、冲突提示、待问问题、初步主题与处理方向、建议后续动作。
不得输出卡片候选 ID 或 registry 变更。
```

### 3.5 [高][错][已修正] v0.4.1 曾依赖不存在的 v0.3 规范

处理状态：`RESOLVED`

原问题：

```text
v0.4.1 继承 v0.3 的五类核心卡
```

当时工作区没有 v0.3 规格文件。五类卡的完整字段主要存在于历史对话，而非权威文件。

后果：

```text
后续 agent 无法可靠追溯系统卡、对象卡、锚点卡、测试卡、边卡的完整定义来源。
```

建议：

```text
新增一份 card schema spec，或将 v0.3 的卡片模板补入 v0.4.1。
```

当前处理：

```text
已新增 docs/superpowers/specs/2026-07-22-design-operating-system-v0.3-card-schema-design.md
v0.4.1 已补充对该文件的明确引用
```

### 3.6 [中][错][已修正] 项目一句话定义过早定性

处理状态：`RESOLVED`

总 README 当前定义使用了：

```text
全局可能性图
局部可达图
控制系统
```

但裁判结论已多次修正：

```text
图和概率只是实现候选；
静态规则、权威状态、可达视图、路径树应分型；
Δ行动集也被修正为更丰富的行动前沿。
```

后果：

```text
README 的项目定义可能压过未完成裁决，形成过早锁定。
```

建议：

```text
将项目一句话定义从总 README 移除，降级为 raw 输入和 inbox 初始条目，避免当成 LOCKED 公理或当前项目定义。
```

当前处理：

```text
已从 docs/game_design_archive/README.md 移除。
已保存为 raw source：BATCH-0001 / SRC-0001。
已建立 inbox 初始条目：[UNREAD] docs/game_design_archive/00_inbox/2026-07-22-user-material-project-one-sentence-definition.md。
```

### 3.7 [中][缺] ID、去重、幂等不足

处理状态：`PENDING_ACTION`

当前 skill 使用：

```text
Use the next unused BATCH-#### ID
```

但没有中央 ID 注册表、hash 去重、并发保护或重复导入处理。

后果：

```text
同一 Markdown 重复拖入可能产生重复批次、重复候选和重复裁决。
```

建议：

```text
建立 ids.md 或 registry/index.md：
- last_batch_id
- last_source_id
- hash -> SRC 映射
- card ID namespace
- duplicate import policy
```

### 3.8 [中][缺][已修正] 未明确支持聊天附件 Markdown

处理状态：`RESOLVED`

skill 只明确处理：

```text
pasted text
local file paths
```

没有明确处理：

```text
直接拖入对话的附件
附件内容不可见
附件无本地路径
附件读取失败
```

后果：

```text
不能保证“直接拖入 md”在所有对话环境中稳定成功。
```

建议：

```text
补充 Dragged Markdown Handling：
如果附件内容可读，保存为 raw source；
如果只有文件名不可读，要求用户提供路径或粘贴内容；
如果读取失败，不创建空批次。
```

当前处理：

```text
game-design-ingest 已明确：附件内容可见则保全；不可见或无路径则要求用户提供路径或正文；不创建空 source。
```

### 3.9 [高][缺] 生产链仍止于测试规格

处理状态：`PENDING_ACTION`

v0.5 明确不定义：

```text
测试脚本语言
模拟器代码结构
UE 自动化测试
具体游戏系统阈值
```

后果：

```text
当前没有“校准规范 -> 可运行核心 -> UE 适配”的实现门。
```

建议：

```text
下一阶段不要继续扩元协议；
应选择一个具体系统试跑完整链路，例如“资源价值系统 / Δ行动集”。
```

## 4. 已有优势

当前体系的有效资产：

```text
raw source 与 inbox 分离正确
SHA-256、来源归因、重复证据处理方向正确
裁判协议严格区分“错”和“缺”
测试结果区分 passed / failed / error / inconclusive，设计合理
禁止测试直接篡改规范，边界正确
```

TempFolder 裁判产物已经提供大量可迁移资产；其裁决规则来源是 `RULE-SRC-0002`，只适用于该次局部审查，不直接定义主工作流迁移规则：

```text
直接继承：20
改写后继承：52
进入验证池：15
拒绝：22
```

这说明系统不是缺少分析，而是缺少一个独立的主工作流迁移事务，用来审查这些局部裁判产物是否、如何进入 archive。

## 5. 修复优先级

### P0：停止语义污染

处理状态：`RESOLVED`

```text
删除“吸收”伪概念，保留 `[TRIAGED]` 作为入口资料查阅拆分状态。
确保所有状态标注、流程门和约束语句都有规则来源。
```

### P1：定义主工作流评审机制

处理状态：`PENDING_ACTION`

```text
不要复用 TempFolder 专用裁决方案。
TempFolder 裁决方案来源：RULE-SRC-0002 tempfolder-agent-output-adjudication。
另行设计 inbox-review / design-reasoning / system-intake-review：
- 从 [TRIAGED] 资料读取
- 执行主工作流自己的评审和推理
- 决定是否进入 OPEN / HYPOTHESIS / TESTING / REWORK / REJECTED
```

### P2：按独立任务处理 TempFolder 裁判结果

处理状态：`PENDING_ACTION`

```text
TempFolder 七份裁判意见可以作为一次性审查产物被单独整理。
它们不定义主工作流裁决机制。
规则来源：RULE-SRC-0002 tempfolder-agent-output-adjudication。
```

### P3：建立 ID 与去重基础设施

处理状态：`PENDING_ACTION`

```text
建立中央 ID / hash 索引。
明确重复导入时复用 SRC 还是建立 duplicate reference。
```

### P4：试跑具体系统

处理状态：`PENDING_ACTION`

```text
用“资源价值系统 / Δ行动集”跑通：
资料 -> 主工作流评审 -> 卡片/缺口/冲突 -> 校准 -> 测试 -> 实现计划
```

## 6. 未做事项

本次归档未执行以下动作：

残留事项状态：`PENDING_ACTION`

```text
未建立 Production Intake Package
未整理 TempFolder 裁判结论；该结论来源 RULE-SRC-0002，不属于主工作流规则
未创建系统卡、对象卡、锚点卡、边卡、测试卡
未建立 gaps.md / conflicts.md / id registry
未建立主工作流评审机制
未进入 UE 或代码实现
```

## 7. 处理去向

文档活跃性处理：

```text
当前活跃性：CLOSED
关闭规则来源：RULE-SRC-0003 review-document-lifecycle
关闭含义：本文件不再继续作为活跃修复工作台；后续工作从下列入口重新开启。
```

建议后继入口：

```text
03_system_registry/gaps.md
  P0-P4 作为流程系统缺口

03_system_registry/conflicts.md
  [TRIAGED] 语义冲突
  外部流程门被误并入 archive 状态机

03_system_registry/systems/
  “资料摄取系统”
  “主工作流评审系统”
  “生产入库系统”
  “ID 与证据索引系统”
```

在这些目标文件创建前，本文件是历史定位入口，不是活跃工作台。引用本文时必须同时检查头部 `活跃性` 和本节后继入口。

## 8. 修订记录

### 2026-07-22 P0/P1 局部修正

已处理：

```text
1. [TRIAGED] 语义冲突已修正。
   - [TRIAGED] 改为只表示“已查阅、已拆分”。
   - 已删除“吸收状态 / 吸收进度 / 是否已吸收进系统”等字段。
   - inbox 改为记录处理去向。
   - 已同步 docs/game_design_archive/README.md。
   - 已同步 docs/game_design_archive/00_inbox/README.md。
   - 已同步 docs/superpowers/specs/2026-07-22-design-operating-system-v0.4-design.md。

2. game-design-ingest 权限已收窄。
   - skill 明确为外部资料引入器。
   - skill 聚焦 raw source 保全、inbox 工作入口、bounded triage。
   - 不再承诺跑通完整生产流程。
   - 不再默认读取 v0.4.1/v0.5 作为强制上下文。
   - 明确 triage output 不是主工作流评审、裁决或推理批准。
   - 明确不自动修改 design registry。
   - 补充附件 Markdown 不可见时必须要求路径或正文，不创建空 source。
   - 已移除卡片候选 ID 输出。
   - 已将“可沉淀条目”改为“初步主题与处理方向”。
```

仍未处理：

```text
1. 尚未建立 Production Intake Package。
2. TempFolder 裁判结论来源 RULE-SRC-0002，可作为独立任务整理，但不阻塞主工作流规则。
3. 尚未建立中央 ID / hash 去重索引。
4. 尚未用具体系统试跑完整链路。
```

已追加处理：

```text
证据保全层已试运行：
- BATCH-0001 / SRC-0001 项目一句话定义 raw 输入
- BATCH-0002 / SRC-0002 初始 grill 设计纲领 19 条

这些条目仍处于 inbox [UNREAD]，尚未经过主工作流评审。
```

### 2026-07-22 历史规格补档

已补齐：

```text
docs/superpowers/specs/2026-07-22-design-operating-system-v0.1-foundation-design.md
docs/superpowers/specs/2026-07-22-design-operating-system-v0.2-governance-design.md
docs/superpowers/specs/2026-07-22-design-operating-system-v0.3-card-schema-design.md
```

影响：

```text
v0.4.1 依赖不存在的 v0.3 规格文件这一问题已处理。
v0.4.1 已补充对 v0.3 规格文件的明确引用。
```

### 2026-07-22 规则来源索引补档

已新增：

```text
docs/game_design_archive/06_rule_sources/README.md
```

已登记：

```text
RULE-SRC-0001 brainstorming-spec-review-gate
```

含义：

```text
“待用户书面复核”来自 brainstorming skill 的设计规格审阅流程门。
它不属于 archive 状态机，也不描述游戏设计条目状态。
```

已补充登记：

```text
RULE-SRC-0002 tempfolder-agent-output-adjudication
```

含义：

```text
TempFolder 裁决方案只适用于 2026-07-22 TempFolder 七个模型目录的大模型讨论输出审查。
它不属于 game_design_archive 主工作流评审机制，也不定义系统卡定型、测试闭环或 UE 实现规则。
```

### 2026-07-22 评审文档生命周期补档

已新增：

```text
docs/game_design_archive/02_analysis/README.md
```

已登记：

```text
RULE-SRC-0003 review-document-lifecycle
```

含义：

```text
评审、审查、复盘和裁决迁移报告使用独立活跃性轴。
活跃性描述文档是否仍承担当前流程驱动职责，不描述设计内容是否定型。
本文件当前活跃性已标记为 CLOSED；残留事项保留为后继入口，不再在本文继续展开。
```
