# 大模型讨论输出裁决执行计划

规则来源：RULE-SRC-0002 tempfolder-agent-output-adjudication  
作用域：仅限 `TempFolder/` 下七个模型目录的大模型讨论输出裁决；不适用于 `game_design_archive` 主工作流。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按已批准规范独立裁决 `TempFolder/` 下七个模型目录，并在每个目录生成一份可追溯、可继承且不含跨模型总结的 `裁判意见.md`。

**Architecture:** 以目录为裁决单位、以文件哈希为证据身份、以原子命题为审查颗粒度。先冻结原始证据，再处理四个单文件目录、一个复合目录和两个重复目录，最后用哈希与结构检查证明原文零修改、重复证据未被重复计权。

**Tech Stack:** Markdown、PowerShell 5、`rg`、SHA-256、人工逻辑审查

---

## 文件结构

### 新建文件

- `TempFolder/DouBaoPro/裁判意见.md`：裁决 `analysis.md`。
- `TempFolder/DoubaoTurbo/裁判意见.md`：裁决 `第一次系统梳理.md`。
- `TempFolder/GPT5_5/裁判意见.md`：裁决 `initial_discussion_analysis.md`。
- `TempFolder/Gemini/裁判意见.md`：裁决 `game_design_discussion_archive.md`。
- `TempFolder/DS/裁判意见.md`：联合裁决两份分析正文与一份流程附件，并检查目录内观点冲突。
- `TempFolder/DS1/裁判意见.md`：独立记录 `00_架构讨论_20260722.md` 的裁决及其与 DS 副本的重复关系。
- `TempFolder/OpenRouter/裁判意见.md`：独立记录分析正文与流程附件的裁决及其与 DS 副本的重复关系。

### 只读文件

- `docs/superpowers/specs/2026-07-22-agent-output-adjudication-design.md`
- `TempFolder/` 下除七份 `裁判意见.md` 外的全部现有文件。

## 裁判文件固定结构

七份文件均严格使用以下九节，不增加总分、排名或跨模型结论：

```markdown
# 对应模型目录的裁判意见

规则来源：`RULE-SRC-0002 tempfolder-agent-output-adjudication`

作用域：仅限 2026-07-22 `TempFolder/` 七个模型目录的大模型讨论输出审查；不属于 `game_design_archive` 主工作流评审机制，也不定义系统卡定型、测试闭环或 UE 实现规则。

## 1. 裁判范围与证据
## 2. 总体诊断
## 3. 命题裁决
## 4. 主要错误
## 5. 关键遗漏
## 6. 可继承资产
## 7. 裁判修正版命题
## 8. 待验证项
## 9. 重复与归因说明
```

## 原始证据基线

执行期间不得改变以下哈希：

| 文件 | SHA-256 |
|---|---|
| `DouBaoPro/analysis.md` | `8435BC623954066ABC649898E7F21CA1828A060941D1E46FC828420ED4419515` |
| `DoubaoTurbo/第一次系统梳理.md` | `F8B9EDBAA66E9CDB602274EC64A718A866019FA48E344DA066928C53E7DFD4D1` |
| `DS/00_架构讨论_20260722.md` | `BF43402878AAB3212C114EB926C1A4CC650389C98A20A014020F8B7B55D30C3E` |
| `DS/01_初步讨论分析.md` | `95AED6C07CDA5FE945BF371028D62FC959C667A54093E6301901B29096DA1900` |
| `DS/INBOX_收纳区.md` | `DC6AC97E38DEE727E57F7AE7EA928662FFFD87D5EC526E7B85A177D193F0F0BC` |
| `DS1/00_架构讨论_20260722.md` | `BF43402878AAB3212C114EB926C1A4CC650389C98A20A014020F8B7B55D30C3E` |
| `Gemini/game_design_discussion_archive.md` | `9045578914DD5D9BDD51DF6C9DF566D20BBCE162214CDF888218F0785D84B903` |
| `GPT5_5/initial_discussion_analysis.md` | `40F6855C249BFCB9110CA6A8B501C909ED17388E3EBB74FEB12AC38EE7C61066` |
| `OpenRouter/00_初步讨论分析.md` | `95AED6C07CDA5FE945BF371028D62FC959C667A54093E6301901B29096DA1900` |
| `OpenRouter/01_收纳区_INBOX.md` | `DC6AC97E38DEE727E57F7AE7EA928662FFFD87D5EC526E7B85A177D193F0F0BC` |

### Task 1: 冻结证据与统一裁判模板

**Files:**
- Read: `docs/superpowers/specs/2026-07-22-agent-output-adjudication-design.md`
- Read: `TempFolder/**/*.md`

- [ ] **Step 1: 重新读取批准规范**

Run:

```powershell
Get-Content -Raw -Encoding UTF8 '.\docs\superpowers\specs\2026-07-22-agent-output-adjudication-design.md'
```

Expected: 输出包含五类裁决标签、九节文件结构、“错/缺”边界和十二项质量门。

- [ ] **Step 2: 验证原始证据哈希**

Run:

```powershell
Get-ChildItem '.\TempFolder' -Recurse -File |
  Where-Object Name -ne '裁判意见.md' |
  Get-FileHash -Algorithm SHA256 |
  Sort-Object Path |
  Format-Table Hash, Path -AutoSize
```

Expected: 十个文件哈希与“原始证据基线”完全一致。

- [ ] **Step 3: 固定命题记录格式**

每个实质命题按以下字段编写，不使用省略字段的表格：

```markdown
### C01 <命题短名>

- **类型**：
- **原文位置**：`文件名:行号`
- **原命题**：
- **裁决**：
- **置信度**：
- **理由**：
- **系统后果**：
- **处理去向**：
```

高杠杆命题在“理由”内追加：

```markdown
- **钢人化**：
- **最强反例**：
- **边界判断**：
```

- [ ] **Step 4: 确认工作区无旧裁判文件**

Run:

```powershell
Get-ChildItem '.\TempFolder' -Recurse -Filter '裁判意见.md'
```

Expected: 无输出。若已有文件，先读取并与本计划协调，禁止覆盖未知改动。

### Task 2: 裁决 DouBaoPro

**Files:**
- Read: `TempFolder/DouBaoPro/analysis.md:32-165`
- Create: `TempFolder/DouBaoPro/裁判意见.md`

- [ ] **Step 1: 提取候选命题并完成归因隔离**

忽略 `analysis.md:8-30` 中作为证据背景的用户原始 19 条，不将其计为模型贡献。至少审查：

- 五层分层是否真能解耦问题，还是把知识管理与系统本体并列造成轴混合。
- “方案 B 是运行时结构、方案 A 是设计时工具”是否成立。
- 六层随机分类中“函数的函数”是否是必要独立层，以及“超越以撒的核武器”是否无证据夸张。
- 支撑依赖与涌现依赖的二分是否完备。
- 五个时间尺度是否是必要模型，还是经验性分类。
- 玩家状态向量是图外输入的主张。
- “19 条全是正反馈”及“所有正反馈路径必须有风险入口”的主张。
- 外显玩家能力与系统内技能资源的区分。
- 脆皮怪奖励封顶或极速衰减的必要性。
- 冻结、半冻结、流动三级规则与“核心乐趣动词必须先定”的主张。

- [ ] **Step 2: 对高杠杆命题做对抗式复审**

必须复审：图/树职责划分、随机 Lv5、状态向量外置、所有正反馈必须接风险、核心乐趣动词是 L0 北极星。

- [ ] **Step 3: 写入裁判文件**

使用 `apply_patch` 创建 `TempFolder/DouBaoPro/裁判意见.md`。命题编号连续，模型原话与裁判新增改写分开归因。

- [ ] **Step 4: 执行单文件质量门**

Run:

```powershell
rg -n "^## [1-9]\. |^### C[0-9]{2} |\[成立\]|\[有限成立\]|\[假说待验证\]|\[不成立\]|\[不可裁决\]|裁判新增" '.\TempFolder\DouBaoPro\裁判意见.md'
```

Expected: 九节齐全；所有命题有编号和裁决；存在修正版命题时均有“裁判新增”。

### Task 3: 裁决 DoubaoTurbo

**Files:**
- Read: `TempFolder/DoubaoTurbo/第一次系统梳理.md:8-146`
- Create: `TempFolder/DoubaoTurbo/裁判意见.md`

- [ ] **Step 1: 提取候选命题**

至少审查：

- “局部图演化是肉鸽乐趣本质”的充分性和可证伪性。
- 三层概率架构是否混合采样层级、冻结时机和条件修正。
- 四类资源是否错误地把玩家能力、信息和时序结构并称为可流转资源。
- “全局图规模指数级增长”是否取决于节点/边表示而非图模型本身。
- 概率揭示梯度的具体局数是否有证据。
- 把脆皮怪作为资源转换站是否会预设其功能。
- 用受伤率、通关时间等推断玩家技术是否混入 build、难度和风险偏好。
- “以撒真正核心是道具交互可推断性”的竞品判断。
- 最小可验证核心环建议是否可直接继承。

- [ ] **Step 2: 对高杠杆命题做对抗式复审**

必须复审：局部图演化定义乐趣、四类资源本体、全局图组合爆炸、以撒核心判断。

- [ ] **Step 3: 写入裁判文件**

使用 `apply_patch` 创建 `TempFolder/DoubaoTurbo/裁判意见.md`。

- [ ] **Step 4: 执行结构检查**

Run:

```powershell
rg -n "^## [1-9]\. |^### C[0-9]{2} " '.\TempFolder\DoubaoTurbo\裁判意见.md'
```

Expected: 九节齐全，命题编号连续且无重复。

### Task 4: 裁决 GPT5_5

**Files:**
- Read: `TempFolder/GPT5_5/initial_discussion_analysis.md:37-209`
- Create: `TempFolder/GPT5_5/裁判意见.md`

- [ ] **Step 1: 提取候选命题**

至少审查：

- 将内容、房间、敌人、玩家技术统一视为图上对象是否过度本体化。
- “纯数据层只定义对象，不写行为”是否把规则数据排除在纯数据之外。
- 全局图加局部可达图作为主方向的边界。
- 每个系统都应是控制器的普遍化是否成立。
- 玩家技术变量是否可观测、可归因且不会诱发隐性动态难度。
- 每个系统强制输入/处理/输出/限制/指标的可证伪价值。
- “以撒级别”拆成测试维度的必要性。
- 脆皮怪按视觉、奖励、威胁、性能、时机分层隔离是否足够而非结论。
- 四个下一步分叉是否遗漏依赖优先级。

- [ ] **Step 2: 对高杠杆命题做对抗式复审**

必须复审：万物图节点化、纯数据不含行为、系统皆控制器、玩家技术可推断变量。

- [ ] **Step 3: 写入裁判文件**

使用 `apply_patch` 创建 `TempFolder/GPT5_5/裁判意见.md`。

- [ ] **Step 4: 执行结构检查**

Run:

```powershell
rg -n "^## [1-9]\. |^### C[0-9]{2} " '.\TempFolder\GPT5_5\裁判意见.md'
```

Expected: 九节齐全，命题编号连续且无重复。

### Task 5: 裁决 Gemini

**Files:**
- Read: `TempFolder/Gemini/game_design_discussion_archive.md:3-65`
- Create: `TempFolder/Gemini/裁判意见.md`

- [ ] **Step 1: 提取候选命题**

至少审查：

- “任何实体效果必须能序列化为纯数据”的可实现边界。
- 自动仿真能否直接验证经济健康和图死锁。
- 为图边加入权重衰减以迫使玩家探索是否制造外部强制。
- 独立 Director AI 统一计算概率场是否属于过早架构。
- 将运气/方差作为玩家可获取资源是否概念成立。
- Clamp、保底和高强度表现透传是否分别解决公平性、稳定性与可读性。
- 把海量脆皮怪定义为泄洪道、短期资源源或系统异常是否过早固定。
- MVP 后再扩全景图的建议是否与“先逻辑后 UE”冲突。

- [ ] **Step 2: 对高杠杆命题做对抗式复审**

必须复审：全效果数据化、Director AI、边权衰减、方差资源化、horde 泄洪道。

- [ ] **Step 3: 写入裁判文件**

使用 `apply_patch` 创建 `TempFolder/Gemini/裁判意见.md`。

- [ ] **Step 4: 执行结构检查**

Run:

```powershell
rg -n "^## [1-9]\. |^### C[0-9]{2} " '.\TempFolder\Gemini\裁判意见.md'
```

Expected: 九节齐全，短文中的高密度工程断言均被单独裁决。

### Task 6: 联合裁决 DS

**Files:**
- Read: `TempFolder/DS/00_架构讨论_20260722.md:31-129`
- Read: `TempFolder/DS/01_初步讨论分析.md:9-125`
- Read: `TempFolder/DS/INBOX_收纳区.md:1-42`
- Create: `TempFolder/DS/裁判意见.md`

- [ ] **Step 1: 分文件建立命题组**

分别使用证据组 `A`、`B`、`P`：

- `A`：四轴架构、概率矩层、系统 DAG、模具等于类型系统、钉子等于不变量。
- `B`：随机是遍历算子、全局图/局部图/采样树、三轴状态、冻结顺序、代理指标、随机冻结时机、技能人群仿真、horde 独立资源、薄纵切。
- `P`：`#新` 输入协议、逐块理解确认、已阅标记和归档索引。

用户原始 19 条只作背景证据，不计为 `A` 组贡献。

- [ ] **Step 2: 审查目录内部一致性**

必须检查：

- `A` 的 L0-L3 分层与 `B` 的 L0-L6 分层是否可兼容或只是不同索引。
- `A` 把树描述为结构，`B` 把树限定为仿真采样产物，两者是否冲突。
- `A` 的概率层按嵌套深度，`B` 追加冻结时机轴，是否应正交而非合并。
- `A` 要求依赖图为 DAG，`B` 承认环代表协同设计簇，是否形成实质矛盾。
- `A` 的四标签协议、`B` 的三轴状态与 `P` 的 `#新/已阅` 是否相互覆盖、冲突或职责不同。

- [ ] **Step 3: 对高杠杆命题做对抗式复审**

必须复审：

- “随机只是遍历算子，质量只住在结构里”。
- “点 13 是点 12 的实现”。
- “只有模具、钉子、接口可以冻结，具体内容绝不冻结”。
- 行动集合熵、build 差异度、分支因子、死资源率可作为核心代理指标。
- 技术资源导致边权玩家相关。
- horde 必须使用独立资源类。
- 通用性只能从具体实例重构获得。
- 依赖图必须为 DAG。

- [ ] **Step 4: 裁决流程附件**

单独判断 `P` 组的可追溯性、人工确认成本、状态正交性和与现有归档协议的兼容性。不得把流程附件的优缺点计入游戏系统分析。

- [ ] **Step 5: 写入裁判文件**

使用 `apply_patch` 创建 `TempFolder/DS/裁判意见.md`。在每个命题“原文位置”中注明 `A/B/P` 对应文件。

- [ ] **Step 6: 执行联合质量门**

Run:

```powershell
rg -n "^## [1-9]\. |^### C[0-9]{2} |00_架构讨论|01_初步讨论分析|INBOX_收纳区" '.\TempFolder\DS\裁判意见.md'
```

Expected: 九节齐全，三个源文件均被引用，内部矛盾有明确裁决。

### Task 7: 裁决 DS1 精确副本

**Files:**
- Read: `TempFolder/DS1/00_架构讨论_20260722.md`
- Read: `TempFolder/DS/裁判意见.md`
- Create: `TempFolder/DS1/裁判意见.md`

- [ ] **Step 1: 验证重复身份**

Run:

```powershell
Get-FileHash -Algorithm SHA256 `
  '.\TempFolder\DS\00_架构讨论_20260722.md', `
  '.\TempFolder\DS1\00_架构讨论_20260722.md'
```

Expected: 两个哈希均为 `BF43402878AAB3212C114EB926C1A4CC650389C98A20A014020F8B7B55D30C3E`。

- [ ] **Step 2: 独立生成目录级裁决**

只裁决 DS `A` 证据组对应的命题，不带入 DS 目录中 `B/P` 证据。相同原文命题的判词、理由核心和置信度必须与 `DS/裁判意见.md` 一致；目录上下文缺失造成的差异必须明确说明。

- [ ] **Step 3: 写入裁判文件**

使用 `apply_patch` 创建 `TempFolder/DS1/裁判意见.md`。第 9 节必须声明该文件不构成第二份独立证据。

- [ ] **Step 4: 检查重复归因**

Run:

```powershell
rg -n "BF434028|重复副本|不构成.*独立证据|^## [1-9]\. " '.\TempFolder\DS1\裁判意见.md'
```

Expected: 哈希、重复关系、证据计权规则和九节结构均存在。

### Task 8: 裁决 OpenRouter 精确副本组

**Files:**
- Read: `TempFolder/OpenRouter/00_初步讨论分析.md`
- Read: `TempFolder/OpenRouter/01_收纳区_INBOX.md`
- Read: `TempFolder/DS/裁判意见.md`
- Create: `TempFolder/OpenRouter/裁判意见.md`

- [ ] **Step 1: 验证两个重复身份**

Run:

```powershell
Get-FileHash -Algorithm SHA256 `
  '.\TempFolder\DS\01_初步讨论分析.md', `
  '.\TempFolder\OpenRouter\00_初步讨论分析.md', `
  '.\TempFolder\DS\INBOX_收纳区.md', `
  '.\TempFolder\OpenRouter\01_收纳区_INBOX.md'
```

Expected: 分别形成 `95AED6...` 和 `DC6AC9...` 两组相同哈希。

- [ ] **Step 2: 独立生成目录级裁决**

只裁决 DS `B/P` 证据组对应命题，不带入 DS 的 `A` 证据。相同命题判词应与 `DS/裁判意见.md` 保持一致，并单列流程附件。

- [ ] **Step 3: 写入裁判文件**

使用 `apply_patch` 创建 `TempFolder/OpenRouter/裁判意见.md`。第 9 节列出两组哈希并声明不构成额外共识。

- [ ] **Step 4: 检查重复归因**

Run:

```powershell
rg -n "95AED6|DC6AC9|重复副本|不构成.*共识|^## [1-9]\. " '.\TempFolder\OpenRouter\裁判意见.md'
```

Expected: 两组重复身份、计权限制和九节结构均存在。

### Task 9: 全量质量门与原文零修改验证

**Files:**
- Read: `TempFolder/*/裁判意见.md`
- Read: `TempFolder/` 下全部原始文件

- [ ] **Step 1: 验证七份产物**

Run:

```powershell
$judgments = Get-ChildItem '.\TempFolder' -Recurse -Filter '裁判意见.md'
$judgments.Count
$judgments.FullName
```

Expected: 数量为 `7`，路径分别属于七个目标目录。

- [ ] **Step 2: 验证每份九节齐全**

Run:

```powershell
Get-ChildItem '.\TempFolder' -Recurse -Filter '裁判意见.md' | ForEach-Object {
  $count = (Select-String -Path $_.FullName -Pattern '^## [1-9]\. ').Count
  [pscustomobject]@{ File = $_.FullName; Sections = $count }
}
```

Expected: 每份 `Sections` 均为 `9`。

- [ ] **Step 3: 扫描禁止内容和空洞措辞**

Run:

```powershell
$redFlags = @('总分', '综合排名', '最终方案', ('T' + 'BD'), ('T' + 'ODO'), '待' + '补', '理由：\s*$', '系统后果：\s*$', '处理去向：\s*$') -join '|'
rg -n $redFlags '.\TempFolder' -g '裁判意见.md'
```

Expected: 无输出。源命题引用中的同名词汇可保留，但必须人工确认不是裁判越界。

- [ ] **Step 4: 验证原始证据哈希未变**

Run:

```powershell
Get-ChildItem '.\TempFolder' -Recurse -File |
  Where-Object Name -ne '裁判意见.md' |
  Get-FileHash -Algorithm SHA256 |
  Sort-Object Path |
  Format-Table Hash, Path -AutoSize
```

Expected: 十个哈希与“原始证据基线”完全一致。

- [ ] **Step 5: 验证重复关系仍成立**

Run:

```powershell
Get-ChildItem '.\TempFolder' -Recurse -File |
  Where-Object Name -ne '裁判意见.md' |
  Get-FileHash -Algorithm SHA256 |
  Group-Object Hash |
  Where-Object Count -gt 1 |
  ForEach-Object {
    [pscustomobject]@{
      Hash = $_.Name
      Count = $_.Count
      Paths = ($_.Group.Path -join ' | ')
    }
  } | Format-List
```

Expected: 恰好三组重复关系，计数分别为 `2`、`2`、`2`。

- [ ] **Step 6: 人工执行最终一致性复核**

逐份确认：

- 每项 `[不成立]` 指出断裂位置。
- 每项 `[有限成立]` 给出边界。
- 每项 `[假说待验证]` 给出所需证据。
- 错误清单与遗漏清单没有重复收录同一问题。
- 修正版命题均标记“裁判新增”。
- DS1 与 OpenRouter 没有被当作额外模型共识。
- 最终只报告文件生成与校验结果，不做内容总结。

## 提交说明

当前 `E:\System` 不是 Git 仓库，本计划不包含 `git add` 或 `git commit`。若执行前工作区被初始化为仓库，再为每份裁判文件分别提交；否则使用原始证据哈希作为零修改证明。
