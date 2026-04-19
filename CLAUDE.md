# 项目协作规范

## 文档边界

`CLAUDE.md` 只保留项目级原则、强约束和文档索引；工程化细则、成熟度评估、质量门禁、优化路线图统一维护在 `docs/ENGINEERING.md`。

## 项目级原则

以下规则为本仓库强约束，任何开发、评审、自动化代理执行都必须遵守：

1. 文档先行：开始实现前，必须先创建或更新相关文档，明确目标、范围、接口或行为变化，然后才能修改代码。
2. SDD（Schema/需求驱动开发）：任务完成后必须同步至文档，文档与代码必须保持一致。
3. 优先维护已有文档：如无必要，禁止新增文档；确需新增时必须明确文档职责并在本文件索引。
4. 中文优先：所有项目文档、代码注释、说明性提交内容均必须使用中文。
5. TDD 流程：先补充或编写测试，再实现代码；代码完成后必须执行对应测试，未验证不得视为完成。
6. 禁止未完成占位：禁止留下 `TODO`、伪实现、假数据占位或“后续补充”逻辑；需求范围内功能必须完整落地。
7. 禁止幻觉：不得虚构接口、配置、依赖、测试结果或上线状态；不确定时先查代码、配置和现有文档。
8. 前端预览优先：涉及前端页面、交互、样式或可视化输出的修改，完成实现后必须先提供预览方式并等待确认，再继续收尾、扩展改动或合并交付。
9. 并行规划：规划任务时必须考虑并行拆分，但不得让并行工作破坏文件所有权和接口一致性。
10. 根因优先：修复问题时必须先定位根因，找到根本原因后再修改代码；禁止用试错方式盲目修复。
11. 数据只来自一处：所有业务数据必须只来自后端 API，禁止使用 localStorage、临时缓存、mock 数据、写死 demo 数据作为业务来源。
12. 前后端联动：修改功能时必须同时考虑前后端实现，涉及接口变更时先确认 API 路径、数据结构、权限和类型定义一致性。
13. 质量门禁：测试失败、构建失败、文档与代码不一致时，不得把任务标记为完成。

## 主线约定

- 前端主线：`frontend/`
- 后端主线：`backend/app/`
- 后端启动入口：`backend/app/main.py`
- 历史旧结构：`backend/main.py`、`backend/models.py`、`backend/database.py`、`backend/routers/` 只能作为迁移参考，不得作为新功能开发入口。
- 后端 API 统一前缀：`/api`
- 前端 API 默认开发地址：`http://localhost:8001/api`

## API 路由惯例（框架约定）

FastAPI 底层基于 Starlette，其路由遵循 Python Web 框架惯例：

### 尾部斜杠规则

| 路由类型 | 示例 | 规则 |
|---------|------|------|
| **列表/集合路由** | `/activities/`、`/materials/`、`/suppliers/` | **必须有**尾部斜杠 |
| **具体资源路由** | `/activities/{id}`、`/materials/{id}` | **无**尾部斜杠 |
| **子资源路由** | `/materials/warehousing-logs`、`/activities/summary/stats` | **无**尾部斜杠 |
| **动作/操作路由** | `/activities/{id}/generate-insight`、`/auth/login` | **无**尾部斜杠 |
| **带路径参数的资源** | `/activities/{id}/tasks` | **无**尾部斜杠 |

### 前端 API 调用必须严格匹配

```
GET /api/activities/         ← 列表路由
GET /api/activities/1        ← 具体资源
GET /api/materials/warehousing-logs  ← 子资源（无斜杠）
```

**禁止**：在列表路由少尾部斜杠，或在子资源路由多尾部斜杠，否则返回 404。

## 常用验证命令

- 前端开发：`cd frontend && npm run dev`（当前 Vite 配置默认端口为 3000）
- 前端测试：`cd frontend && npm test`
- 前端构建：`cd frontend && npm run build`
- 前端预览：`cd frontend && npm run preview -- --port 5173`
- 后端启动：`cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001`
- 后端测试：`cd backend && python -m pytest tests/ -q`

## 文档索引

| 文档 | 职责 |
|------|------|
| `docs/ENGINEERING.md` | 工程化治理、成熟度评估、质量门禁、全面优化路线图 |
| `docs/SPEC.md` | 产品需求、业务模块、功能边界 |
| `docs/DESIGN.md` | 技术架构、目录结构、接口设计、关键技术方案 |
| `docs/TASKS.md` | 任务拆分、优先级、状态跟踪 |
| `docs/PROGRESS.md` | 里程碑、验证结果、风险状态 |
| `README.md` | 项目概览、快速启动、初始账号 |
| `frontend/README.md` | 前端开发说明 |
| `backend/README.md` | 后端开发说明 |

## 文档更新规则

- 改功能：更新 `docs/SPEC.md` 或相关 README。
- 改架构：更新 `docs/DESIGN.md` 和 `docs/ENGINEERING.md`。
- 改工程流程、质量门禁、优化路线：更新 `docs/ENGINEERING.md`。
- 改项目级强约束或文档入口：更新 `CLAUDE.md`。
- 改任务状态：更新 `docs/TASKS.md` 和 `docs/PROGRESS.md`。
- 改启动命令、端口、环境变量：更新 `README.md`、`frontend/README.md` 或 `backend/README.md`。

## 提交与变更要求

- 提交信息使用中文，建议采用“动词 + 范围 + 结果”的简洁格式。
- 涉及前端页面、交互、样式或可视化输出的交付说明必须附带预览方式。
- 仅在必要处添加中文注释，注释应解释原因、约束或边界。
- 不允许提交未使用代码、调试残留、无效脚本或占位分支。
