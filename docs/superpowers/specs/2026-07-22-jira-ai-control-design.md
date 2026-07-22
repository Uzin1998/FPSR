# Jira AI Control Design

日期：2026-07-22  
状态：待用户书面复核  
规则来源：RULE-SRC-0001 brainstorming-spec-review-gate；RULE-SRC-0004 jira-ai-control-boundary  
上游规格：docs/superpowers/specs/2026-07-22-jira-operating-layer-design.md

## 1. 背景

`2026-07-22-jira-operating-layer-design.md` 定义了 Jira 作为 DOS 的执行控制层，但当时的非目标明确排除了自动化 API 或 webhook。

本文档是后续扩展：在不改变 Markdown/Git 作为设计真相源的前提下，为当前 Jira 项目增加一个 AI 可调用的本地 REST CLI 控制面。

## 2. 目标

为当前 Jira Cloud 项目建立一个可审计、可测试、可收敛的 AI 控制入口。

AI 的控制方式限定为：

```text
AI -> 本地命令行 CLI -> Jira Cloud REST API -> 指定 Jira 项目
```

目标结果：

```text
1. AI 可以验证 Jira 凭据和项目 key。
2. AI 可以查询当前 Jira 项目中的 issue。
3. AI 可以按 DOS 描述模板创建 issue。
4. AI 可以按 Jira workflow 执行状态流转。
5. AI 可以向 issue 追加证据、裁决来源或执行记录。
6. 所有写操作均有明确的 dry-run / apply 边界。
```

## 3. 非目标

第一版不做：

```text
1. 不接入 MCP 服务器。
2. 不接入 webhook。
3. 不把 Jira 当作 Markdown 真相源。
4. 不把 Jira workflow 状态与 archive 文档状态机合并。
5. 不存储 Jira token、邮箱或站点 URL 到仓库。
6. 不支持删除 issue。
7. 不支持跨项目批量修改。
8. 不同步 Jira 自定义字段 ID；第一版统一写入 Description 绑定块。
```

## 4. 控制边界

第一版 CLI 只允许操作一个显式配置的 Jira 项目。

项目由环境变量指定：

```text
JIRA_BASE_URL
JIRA_EMAIL
JIRA_API_TOKEN
JIRA_PROJECT_KEY
```

写操作规则：

```text
1. create / transition / comment 均属于写操作。
2. 写操作默认 dry-run，只打印将要发送的请求摘要。
3. 写操作只有在显式传入 --apply 时才真正调用 Jira API。
4. CLI 不提供 delete 命令。
5. CLI 不提供 bulk-update 命令。
```

读取操作规则：

```text
1. whoami / project / get / search 属于读取操作。
2. 读取操作可以直接调用 Jira API。
3. search 默认限制在 JIRA_PROJECT_KEY 指定项目内。
```

## 5. 命令面

第一版 CLI 提供以下命令：

```text
doctor
  检查环境变量是否齐全，不调用 Jira API。

whoami
  调用 /rest/api/3/myself，验证账号身份。

project
  调用 /rest/api/3/project/{JIRA_PROJECT_KEY}，验证项目存在。

get ISSUE_KEY
  读取单个 issue 的 key、summary、type、status、description。

search --jql "..."
  查询 issue。CLI 必须自动限制 project = JIRA_PROJECT_KEY，除非命令显式禁止扩展。

create --type TYPE --summary SUMMARY --artifact-id ID --truth-link PATH --source-id ID
  创建带 DOS 绑定块的 issue。

transition ISSUE_KEY --to STATUS
  根据目标状态名动态发现 transition ID，然后执行状态流转。

comment ISSUE_KEY --body TEXT
  向 issue 追加评论。
```

## 6. DOS 描述绑定块

第一版不依赖 Jira 自定义字段 ID。所有 issue 创建都必须在 Description 中写入以下块：

```text
Artifact ID:
Truth Link:
Source ID:
Evidence Links:
Decision Source:

Done Check:
- [ ] Markdown updated or no-doc-change reason recorded
- [ ] Artifact ID or Source ID bound
- [ ] Truth Link traceable
- [ ] Evidence links present for Decision/Bug/Gap/Validation
- [ ] No dangling referenced IDs
- [ ] Rule Source registered or cited if this issue creates a rule/status statement
```

字段语义沿用 `2026-07-22-jira-operating-layer-design.md`：

```text
Artifact ID 绑定 SYS-* / OBJ-* / ANCHOR-* / TEST-* / EDGE-* / GAP-* / CONFLICT-*。
Truth Link 指向 Markdown 真相源路径或仓库链接。
Source ID 绑定 BATCH-* / SRC-* / REPORT-* / RULE-SRC-*。
Evidence Links 记录证据链接、测试报告、相关 source、对话归档。
Decision Source 记录裁决依据，主要用于 Decision / Bug / Gap。
```

## 7. Issue 类型边界

CLI 允许创建的 issue type 固定为：

```text
Epic
Task
Bug
Decision
Research
Gap
Validation
```

边界规则：

```text
Bug = 错，表示已有规则被违反。
Gap = 缺，表示缺信息、缺证据、缺决策或缺实现。
Decision = 裁决，不等于执行完成。
Validation = 验证动作，不等于设计定型。
```

CLI 必须拒绝未知 issue type。

## 8. 状态边界

CLI 的 `transition --to` 只接受 Jira 行动流状态：

```text
Backlog
Ready
In Progress
Blocked
Review
Done
```

CLI 必须拒绝 archive 文档状态：

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

拒绝原因必须明确说明：

```text
archive 文档状态机不能写入 Jira workflow。
```

## 9. Jira API 合约

CLI 只依赖 Jira Cloud REST API v3：

```text
GET  /rest/api/3/myself
GET  /rest/api/3/project/{projectKey}
GET  /rest/api/3/issue/{issueKey}
GET  /rest/api/3/search
POST /rest/api/3/issue
GET  /rest/api/3/issue/{issueKey}/transitions
POST /rest/api/3/issue/{issueKey}/transitions
POST /rest/api/3/issue/{issueKey}/comment
```

认证方式：

```text
Basic Auth，用户名为 JIRA_EMAIL，密码为 JIRA_API_TOKEN。
```

## 10. 错误处理

CLI 必须 fail closed。

错误处理规则：

```text
缺少环境变量：
  输出缺失变量名，不调用 Jira API。

401：
  输出认证失败，提示检查 JIRA_EMAIL / JIRA_API_TOKEN。

403：
  输出权限不足，提示检查 Jira 项目权限或 API token scope。

404：
  输出项目或 issue 不存在，并打印当前 JIRA_PROJECT_KEY。

429：
  输出 Jira rate limit，保留原始 retry-after 信息。

未知 issue type：
  拒绝请求，不调用 Jira API。

未知目标状态：
  拒绝请求，不调用 Jira API。

archive 状态被传入 transition：
  拒绝请求，不调用 Jira API。
```

## 11. 安全规则

```text
1. 不在仓库内保存真实 Jira API token。
2. 不在日志中打印 JIRA_API_TOKEN。
3. dry-run 输出不得包含 Authorization header。
4. --apply 必须是显式参数。
5. 写操作返回 Jira issue key、URL 和 HTTP 状态摘要即可，不输出认证材料。
```

## 12. 测试策略

第一版测试分两层：

```text
1. 无网络单元测试：
   验证环境变量读取、输入校验、DOS 描述块生成、dry-run 行为、状态拒绝规则。

2. 凭据存在时的手动验收：
   doctor
   whoami
   project
   create --dry-run
   create --apply
   get ISSUE_KEY
   transition ISSUE_KEY --to Review --apply
   comment ISSUE_KEY --body "..." --apply
```

单元测试不依赖真实 Jira。

## 13. 验收标准

本次 AI 控制面接入完成的最低验收：

```text
1. 仓库内存在 Jira REST CLI。
2. CLI 无凭据时能指出配置缺口。
3. CLI 不会把 token 写入文件或输出。
4. CLI 能生成符合 DOS 绑定要求的 issue description。
5. CLI 能拒绝未知 issue type。
6. CLI 能拒绝 archive 文档状态进入 Jira transition。
7. CLI 的写操作默认 dry-run。
8. CLI 只有在 --apply 显式出现时才写入 Jira。
9. 有凭据时，CLI 可以验证当前 Jira 项目。
10. 有凭据时，CLI 可以创建、读取、流转和评论一个测试 issue。
```

## 14. 实施所需输入

实现 CLI 不需要真实凭据。

进行真实 Jira 验收前，需要用户在当前终端环境提供：

```text
JIRA_BASE_URL
JIRA_EMAIL
JIRA_API_TOKEN
JIRA_PROJECT_KEY
```

若 `JIRA_PROJECT_KEY` 不是 `DOS`，最终报告必须记录实际 key。
