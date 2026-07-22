# 设计操作系统 v0.5 测试闭环规格

日期：2026-07-22  
状态：待用户书面复核
规则来源：RULE-SRC-0001 brainstorming-spec-review-gate

## 1. 目标

v0.5 只定义测试定义与测试报告闭环，使 v0.4.1 中“已校准结构化规格可被测试读取”的规则具备可执行边界。

本阶段不实现测试代码，不设计具体游戏系统，不进入 UE，不引入技术栈。只规定：

```text
测试定义卡如何声明测试
测试模块如何读取规格
测试报告如何记录证据
测试失败如何回流到缺口、冲突、返工或建议补丁
```

## 2. 上游依赖

v0.5 依赖 v0.4.1 的五条结论：

```text
源文件副本进入 raw source custody，inbox 只作为工作入口
规范文档是语义真相源
YAML Front Matter 是机器可读投影
测试模块只读取已校准投影
测试模块不得直接修改规范
```

测试读取门槛继承 v0.4.1：

```text
projection_status = calibrated
calibration.status = calibrated
verification_status in [none, pending, failed]
status in [HYPOTHESIS, TESTING, LOCKED, REWORK]
```

## 3. 测试定义卡

测试定义卡描述“要验证什么”，不是测试脚本本身。

最小字段：

```yaml
---
id: TEST-0001
card_type: test_definition
name:
responsibility_faces: [R3]
status: HYPOTHESIS
version: 0.1.0
sources:
depends_on:
gaps:
conflicts:
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

test_kind:
target_cards:
read_specs:
input_state:
player_models:
sample_size:
metrics:
pass_thresholds:
failure_report_schema:
forbidden_fixes:
regression_scope:
output_routes:
---
```

字段解释：

```text
test_kind
  测试类别。允许值见第 4 节。

target_cards
  被验证的卡片 ID。可以是系统卡、对象卡、锚点卡、边卡。

read_specs
  测试实际读取的结构化规格 ID 或卡片 ID。

input_state
  抽象初始状态。不得包含未校准设计。

player_models
  使用哪些抽象玩家模型。结构一致性测试可为空。

sample_size
  样本量。非随机测试可写 1。

metrics
  输出指标定义。

pass_thresholds
  通过阈值。必须说明阈值来源。

failure_report_schema
  失败报告应包含哪些字段。

forbidden_fixes
  明确禁止的修复方式。

regression_scope
  若该测试失败或相关卡片返工，需要重跑哪些测试。

output_routes
  报告可流向 GAP / CONFLICT / REWORK / PATCH_CANDIDATE 的规则。
```

## 4. 第一批测试类别

v0.5 只定义四类起步测试。

```text
structure_consistency
  结构一致性测试。检查 ID、引用、状态、字段完整性、校准版本、冲突登记。

probability_statistics
  概率统计测试。检查随机变量分布、稳定性、条件修正、跨参数一致性。

resource_flow_economy
  资源流/经济测试。检查资源产出、消耗、通胀、死资源、行动集合变化。

anti_pattern_detection
  反模式检测。检查禁止特征是否被规格或仿真结果触发。
```

每个测试类别都必须回答：

```text
它读什么
它不读什么
它能证明什么
它不能证明什么
失败时优先怀疑哪个责任面
```

## 5. 测试报告

测试报告记录“发生了什么”，不是修复方案本身。

报告最小字段：

```yaml
report_id:
test_id:
test_kind:
run_id:
run_at:
spec_versions:
input_state_id:
player_models:
sample_size:
result: passed | failed | error | inconclusive
metrics:
failed_thresholds:
evidence:
suspected_responsibility_faces:
affected_cards:
forbidden_fixes_triggered:
recommended_routes:
patch_candidates:
regression_required:
notes:
```

结果定义：

```text
passed
  所有阈值通过。只说明该测试未发现问题，不说明系统整体正确。

failed
  一个或多个阈值失败，且测试本身有效。

error
  测试运行异常、输入规格非法或工具错误。不能当作设计失败。

inconclusive
  数据不足、样本不足、阈值不适用或测试定义本身存在缺口。
```

## 6. 失败归因

测试失败必须先做责任面归因，不允许直接调参。

责任面：

```text
R0 体验锚点
R1 元系统/流程产生器
R2 关系模型
R3 概率数值
R4 实现适配
```

归因规则：

```text
如果指标本身无法解释体验目标，优先怀疑 R0 或测试定义。
如果输入输出或硬约束互相冲突，优先怀疑 R1。
如果对象、边、可达性或依赖关系异常，优先怀疑 R2。
如果分布、阈值、稳定性或样本统计异常，优先怀疑 R3。
如果测试工具、数据加载或运行环境异常，优先怀疑 R4 或测试实现。
```

失败报告可以列多个疑似责任面，但必须给出排序理由。

## 7. 禁止修复方式

每张测试定义卡必须声明 `forbidden_fixes`。

默认禁止：

```text
不得针对单个失败样本定向调参。
不得让测试模块直接修改规范。
不得用未校准 YAML 覆盖 Markdown 语义。
不得把 error 当作 failed。
不得把 inconclusive 当作 passed。
不得为了通过测试删除反模式检测。
不得把体验问题伪装成纯数值问题。
```

如果必须违反默认禁止项，必须进入返工流程并记录裁决理由。

## 8. 报告回流

测试报告只能生成四类回流对象：

```text
GAP
  信息不足、字段未知、阈值来源不明、测试定义无法裁决。

CONFLICT
  规格之间、指标之间、测试结果与已定型规范之间出现不兼容。

REWORK
  已有卡片需要返工。必须给出触发证据和影响范围。

PATCH_CANDIDATE
  建议补丁或候选参数。不能自动应用，必须回到规范文档审查。
```

路由规则：

```text
result = error
  默认进入 GAP 或测试实现问题，不进入设计返工。

result = inconclusive
  默认进入 GAP，要求补充阈值、样本量、输入状态或测试定义。

result = failed 且违反已定型约束
  进入 REWORK，并可能生成 CONFLICT。

result = failed 且阈值来源不稳
  进入 GAP，不直接返工系统。

result = failed 且存在明确局部参数候选
  生成 PATCH_CANDIDATE，但必须标记为未应用。
```

## 9. 回归规则

每个测试定义卡必须声明 `regression_scope`。

回归范围至少包含：

```text
直接依赖该卡片的测试
读取同一结构化规格的测试
引用同一对象/边/系统的测试
曾因该卡片失败而生成过报告的测试
```

返工完成后：

```text
原报告不删除
新报告使用新 report_id
新报告引用旧 report_id
若回归通过，只关闭对应 GAP / CONFLICT / REWORK
不得重写历史失败结果
```

## 10. 最小闭环

v0.5 的最小闭环：

```text
TEST-0001 测试定义卡
-> 读取已校准结构化规格
-> 运行测试或仿真
-> REPORT-0001 测试报告
-> 路由到 GAP / CONFLICT / REWORK / PATCH_CANDIDATE
-> 规范文档返工
-> 重新投影
-> 重新校准
-> 回归测试
```

闭环验收：

```text
测试知道自己读了什么版本
报告能定位失败证据
失败能指向疑似责任面
禁止修复方式被显式记录
建议补丁不能自动生效
返工后有新报告而不是覆盖旧报告
```

## 11. 四类测试的最低指标

### 11.1 结构一致性

最低指标：

```text
missing_required_fields
invalid_id_references
uncalibrated_inputs
unregistered_conflicts
unknown_without_gap
version_mismatch
```

### 11.2 概率统计

最低指标：

```text
observed_distribution
expected_distribution
deviation
stability_across_runs
condition_effect_size
cross_parameter_consistency
sample_size
confidence_notes
```

### 11.3 资源流/经济

最低指标：

```text
resource_inflow
resource_outflow
net_growth
dead_resource_rate
action_set_delta
dominant_strategy_rate
runaway_growth_flags
scarcity_failure_flags
```

### 11.4 反模式检测

最低指标：

```text
triggered_anti_patterns
affected_cards
trigger_frequency
severity
evidence_samples
blocked_actions
recommended_route
```

## 12. 设计边界

v0.5 不定义：

```text
具体测试脚本语言
模拟器代码结构
统计库选择
UE 自动化测试
具体游戏系统阈值
具体资源/概率/房间模型
```

v0.5 定义：

```text
测试定义卡字段
测试报告字段
失败归因规则
禁止修复方式
报告回流规则
回归规则
四类起步测试的最低指标
```

## 13. 下一步建议

v0.5 后不继续纯元系统迭代。

下一步应选择一个具体系统试跑完整链路。推荐第一个试跑对象：

```text
资源价值系统 / Δ行动集
```

原因：

```text
它是全局公理级系统
它能暴露资源、经济、玩家技术、随机和房间可达性的接口问题
它适合用结构一致性和资源流测试做第一批验证
```

如果试跑时发现 v0.4.1/v0.5 协议阻塞，再局部返工协议；不要继续抽象扩版。
