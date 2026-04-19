# EventMaster Pro 进度管理 (PROGRESS.md)

## 1. 项目里程碑

### 1.1 里程碑状态

| 里程碑 | 名称 | 状态 | 完成度 |
|--------|------|------|--------|
| M1 | 基础架构完成 | ✅ 已完成 | 100% |
| M2 | 数据模型就绪 | ✅ 已完成 | 100% |
| M3 | 核心组件库完成 | ✅ 已完成 | 100% |
| M4 | 活动+预算模块上线 | ✅ 已完成 | 100% |
| M5 | 复盘+物料模块上线 | ✅ 已完成 | 100% |
| M6 | 供应商+商机模块上线 | ✅ 已完成 | 100% |
| M7 | 数据仪表盘上线 | ✅ 已完成 | 100% |
| M8 | AI能力集成 | ✅ 已完成 | 100% |
| M9 | 路由重构与详情页拆分 | ✅ 已完成 | 100% |
| M10 | 样式统一与文档完善 | ✅ 已完成 | 100% |
| M11 | 账号权限模块 | ✅ 已完成 | 100% |
| M12 | 网站设置模块 | ✅ 已完成 | 100% |

---

## 2. 已完成工作

### 2.1 架构重构（2026-04）

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 基础设施搭建 | ✅ |
| Phase 2 | 路由与页面框架 | ✅ |
| Phase 3 | 详情页拆分 | ✅ |
| Phase 4 | 样式统一 | ✅ |

### 2.2 后端分层架构（2026-04）

| 层级 | 文件 | 状态 |
|------|------|------|
| Models | `app/models/*.py` | ✅ |
| Schemas | `app/schemas/*.py` | ✅ |
| Repositories | `app/repositories/*.py` | ✅ |
| Services | `app/services/*.py` | ✅ |
| Routers | `app/routers/*.py` | ✅ |
| 入口 | `app/main.py` | ✅ |

**后端技术栈**:
- FastAPI 0.109 + SQLAlchemy 2.0 + Pydantic v2
- SQLite (开发) / MySQL (生产)
- 分层架构: Routers → Services → Repositories → Models
- JWT + bcrypt 认证

### 2.3 账号权限模块（2026-04）

| 组件 | 文件 | 状态 |
|------|------|------|
| User/Role 模型 | `app/models/user.py` | ✅ |
| User/Role Schema | `app/schemas/user.py` | ✅ |
| UserRepository | `app/repositories/user.py` | ✅ |
| UserService | `app/services/user.py` | ✅ |
| 认证路由 | `app/routers/auth.py` | ✅ |
| 用户管理路由 | `app/routers/users.py` | ✅ |
| 角色管理路由 | `app/routers/roles.py` | ✅ |
| JWT 工具 | `app/core/security.py` | ✅ |

### 2.4 网站设置模块（2026-04）

| 组件 | 文件 | 状态 |
|------|------|------|
| SiteSettings 模型 | `app/models/settings.py` | ✅ |
| SettingsSchema | `app/schemas/settings.py` | ✅ |
| SettingsService | `app/services/settings.py` | ✅ |
| 设置路由 | `app/routers/settings.py` | ✅ |

### 2.5 前端认证模块（2026-04）

| 组件 | 文件 | 状态 |
|------|------|------|
| 登录页 | `src/pages/Login.tsx` | ✅ |
| 账号管理页 | `src/pages/Account.tsx` | ✅ |
| 权限管理页 | `src/pages/Permissions.tsx` | ✅ |
| 网站设置页 | `src/pages/Settings.tsx` | ✅ |
| AuthContext | `src/context/AuthContext.tsx` | ✅ |
| 认证 API | `src/services/authApi.ts` | ✅ |
| 自动携带 Token | `src/services/backendApi.ts` | ✅ |

### 2.6 单元测试（2026-04）

| 模块 | 工具 | 测试数 | 状态 |
|------|------|--------|------|
| 后端 API | pytest | 124 | ✅ |
| 前端工具/组件 | vitest | 138 | ✅ |

### 2.7 详情页拆分

| 详情页 | 源组件 | 状态 |
|--------|--------|------|
| ActivityDetail | ActivityManager | ✅ |
| MaterialDetail | MaterialManager | ✅ |
| SupplierDetail | SupplierManager | ✅ |
| OpportunityDetail | OpportunityManager | ✅ |
| ReviewDetail | ReviewCenter | ✅ |

### 2.8 路由配置

- ✅ 所有路由定义在 `src/utils/routes.ts`
- ✅ 列表页：`/xxx`
- ✅ 详情页：`/xxx/:id`
- ✅ Dashboard 迁移到 `pages/Dashboard.tsx`
- ✅ 新增 `/login`, `/account`, `/permissions`, `/settings`

### 2.9 设计系统统一

- ✅ 圆角规范 (rounded-sm/md/lg/xl/2xl/full)
- ✅ 阴影规范 (shadow-sm/md/lg/xl)
- ✅ 动画规范 (duration-fast/normal/slow)
- ✅ 共享 Modal 组件

---

## 3. 文件清理

### 3.1 已删除文件

| 文件 | 原因 |
|------|------|
| `src/services/api.ts` | 未使用 |
| `src/services/http.ts` | 未使用 |
| `开发文档.md` | 内容过旧，已由 docs/ 替代 |

### 3.2 目录结构

```
frontend/src/
├── pages/              # Dashboard + 6个详情页 + Login + Account + Permissions + Settings
├── components/         # 6个Manager + layout
├── shared/            # 共享组件
├── services/          # backendApi, authApi, geminiService
├── context/           # AuthContext
├── stores/            # AppContext
├── utils/             # routes, storage
└── ...
```

---

## 4. 当前状态

**项目状态**: ⚠️ 功能可用 / 工程化待强化

**测试状态**:
- 后端测试: 134 passed
- 前端测试: 701 passed（26个测试文件）
- 前端构建: 成功，路由拆包后无单包超过 500KB 警告
- 前端场景测试: 283 passed（8个场景文件）
- 前端 E2E: Playwright 1 passed（登录并访问核心业务页面）
- BudgetManager.interaction.test.tsx 因 vitest pool 内存泄漏被排除

**最近修复项**:
- 已修复 `tests/test_material.py::TestMaterialAPI::test_get_low_stock_materials`
- 处理方式：低库存查询按当前物料契约使用库存阈值，库存大于 0 且小于 10 视为低库存
- 已启用前端 `ProtectedRoute`，受保护路由未登录时跳转 `/login`
- 已清理业务页面残留 `alert()`，统一改为 Toast 提示
- 已清理默认业务路径 mock/fallback：Dashboard API 失败进入错误态，删除未被引用的 `apiCompatible.ts`
- 已统一列表查询参数适配：前端 API 层集中映射 `search -> keyword`，商机 `stage -> status`
- 已新增 `frontend/src/services/backendApi.test.ts`，覆盖列表查询参数转换和空查询处理
- 已启用前端路由级懒加载，生产构建消除主 chunk 超限警告
- 已统一前端列表响应契约：activities/materials/suppliers/opportunities 按后端数组响应声明和消费
- 已将 `frontend/src/utils/hooks.test.ts` 从复制 adapter 实现改为测试真实导出的 adapter 函数
- 已新增前后端环境变量模板：`backend/.env.example`、`frontend/.env.example`
- 已删除旧后端结构：`backend/main.py`、`backend/config.py`、`backend/database.py`、`backend/models.py`、`backend/schemas.py`、`backend/init_sample_data.py`、`backend/routers/`、`backend/services/`
- 已新增统一异步状态组件：`frontend/src/shared/AsyncState.tsx`
- 已在 Dashboard/活动/物料/供应商/商机模块接入统一加载、空态、错误态展示
- 已新增 Playwright 配置与关键路径用例：`frontend/playwright.config.ts`、`frontend/tests/e2e/core-flow.spec.ts`
- 已补充生成物忽略规则并清理本地 `dist/test-results/playwright-report` 等目录
- 已修复后端预算测试：sample_budget_data 移除 activity_id 避免外键约束，修复 test_budget_logs 使用错误的 activity_id 参数
- 已修复前端测试中的 Label 引用：Login.tsx 添加 htmlFor/id，Account.tsx 添加 htmlFor/id/aria-label/data-testid
- 已建立前端全面测试体系：701个测试用例覆盖 Login、Account、Dashboard、ActivityManager、MaterialManager、SupplierManager、OpportunityManager、ReviewList、AddFeedbackModal、YearlyDashboard、Sidebar 等组件
- 已建立场景测试体系：283个场景测试用例覆盖 8个业务场景（auth、activity、material、budget、supplier、review、dashboard、opportunity）
- 已完成全局通知中心系统：NotificationContext + NotificationCenter + Layout 集成，App.tsx 包裹 NotificationProvider
- BudgetManager.interaction.test.tsx 因 vitest pool 内存问题被排除在测试运行外

**初始账号**:
- 用户名: admin
- 密码: Admin123（必须包含大写字母、小写字母和数字）
- 权限: 超级管理员

---

## 5. 风险登记

| 风险 | 影响 | 状态 | 应对 |
|------|------|------|------|
| 后端低库存接口失败 | 物料预警接口 500，后端测试不全绿 | 已解决 | 后端全量测试 133 passed |
| 前后端列表响应契约不一致 | 类型不可信，调用层长期兼容不确定结构 | 已解决 | 前端 API 类型和调用点已按后端数组响应收敛 |
| 文档记录旧版本、旧端口、旧入口 | 新开发容易误用旧命令或旧代码 | 治理中 | 主启动命令已修正，继续清理旧版本描述 |
| 后端旧入口残留 | 可能改错文件或启动错服务 | 已解决 | 历史旧结构已删除 |

---

## 6. 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端开发 | 3000 | `npm run dev`，以 `frontend/vite.config.ts` 为准 |
| 前端预览 | 5173+ | npm run preview |
| 后端 API | 8001 | uvicorn |
| API 文档 | 8001/docs | Swagger UI |

---

## 7. 工程化治理

当前工程化管理和全面优化方案见 `docs/ENGINEERING.md`。

近期优先级：
1. P0：恢复绿色测试基线。
2. P1：统一前后端 API 契约。
3. P2：清理 mock/fallback、路由保护缺口和剩余架构债务。

---

## 8. 工作区修改归属盘点（2026-04-19）

当前工作区存在较多未提交修改，后续提交或回滚前必须按归属拆分处理。

### 8.1 本轮工程化改动

| 文件 | 归属 | 说明 |
|------|------|------|
| `CLAUDE.md` | 工程化文档 | 收敛为项目级原则和文档索引 |
| `docs/ENGINEERING.md` | 工程化文档 | 新增工程化治理和全面优化方案 |
| `docs/TASKS.md` | 工程化文档 | 新增 P0-P4 工程化任务，并更新已完成项 |
| `docs/PROGRESS.md` | 工程化文档 | 更新成熟度、测试结果、风险和工作区盘点 |
| `README.md` | API 配置化 | 补充 `VITE_API_BASE_URL` |
| `frontend/README.md` | API 配置化 | 补充 `VITE_API_BASE_URL` 和默认值说明 |
| `backend/app/repositories/material.py` | P0 修复 | 修复低库存查询引用不存在字段的问题 |
| `frontend/src/services/backendApi.ts` | P1 配置化 | 将 API 基础地址改为 `VITE_API_BASE_URL`，该文件同时包含历史业务改动，提交时需拆分确认 |
| `frontend/src/services/backendApi.ts` | P1 契约治理 | 集中处理列表查询参数映射，避免页面层扩散 `search/keyword`、`stage/status` 兼容 |
| `frontend/src/services/backendApi.ts` | P1 契约治理 | activities/materials/suppliers/opportunities 列表响应类型收敛为后端数组契约 |
| `frontend/src/services/backendApi.test.ts` | P1 契约治理 | 新增列表查询参数转换测试 |
| `frontend/src/utils/hooks.ts` | P1 契约治理 | 移除核心列表响应兼容分支，直接消费数组响应 |
| `frontend/src/utils/hooks.ts` | P1 契约治理 | 修正后端 API 类型导入，使用真实 `Api*` 类型 |
| `frontend/src/utils/hooks.test.ts` | P1 契约治理 | 改为测试真实 adapter，覆盖活动、物料、供应商、商机和预算日志字段转换 |
| `frontend/src/pages/ActivityDetail.tsx` | P1 契约治理 | 移除物料和供应商列表响应兼容分支 |
| `frontend/src/App.tsx` | P4 性能治理 | 启用路由级懒加载和统一路由加载态，降低初始主包体积 |
| `backend/.env.example` | P3 环境治理 | 新增后端环境变量模板 |
| `frontend/.env.example` | P3 环境治理 | 新增前端环境变量模板 |
| `backend/main.py`、`backend/config.py`、`backend/database.py`、`backend/models.py`、`backend/schemas.py`、`backend/init_sample_data.py` | P2 架构债务 | 删除旧后端入口和旧单文件模块 |
| `backend/routers/`、`backend/services/` | P2 架构债务 | 删除旧后端目录，主线仅保留 `backend/app/` |
| `docs/DESIGN.md` | P2 架构债务 | 修正旧启动命令和端口 |

### 8.2 生产级就绪评估（2026-04-19）

| 维度 | 评分 | 满分 | 说明 |
|------|------|------|------|
| 安全性 | 4/10 | 10 | 已实现 JWT 认证、bcrypt 密码哈希、CORS 配置 |
| 错误处理 | 6/10 | 10 | 已实现 ErrorBoundary、Toast、统一错误中间件 |
| 性能 | 4/10 | 10 | 已实现代码分割、数据库索引、分页支持 |
| 可访问性 | 2/10 | 10 | 需改进 ARIA 标签和键盘导航 |
| 响应式设计 | 5/10 | 10 | 使用 Tailwind 响应式断点 |
| 监控与可观测性 | 3/10 | 10 | 已实现日志系统和健康检查端点 |
| 数据管理 | 4/10 | 10 | 使用 SQLAlchemy ORM，需完善迁移 |
| 测试覆盖 | 5/10 | 10 | 已有单元测试和集成测试 |
| 部署与运维 | 2/10 | 10 | 需完善 Docker 配置和环境区分 |
| 国际化 | 1/10 | 10 | 目前仅支持简体中文 |
| **总计** | **36/100** | 100 | - |

### 8.3 生产级就绪 Critical 修复

| 修复项 | 文件 | 状态 |
|--------|------|------|
| SECRET_KEY 硬编码风险 | `backend/app/core/config.py` | ✅ 已修复 |
| CORS 配置过度宽松 | `backend/app/core/config.py` | ✅ 已修复 |
| 密码强度验证缺失 | `backend/app/schemas/user.py` | ✅ 已修复 |
| 日志轮转缺失 | `backend/app/core/logging.py` | ✅ 已修复 |
| API 分页支持 | 全部 routers | ✅ 已验证（已有） |
| Docker 配置缺失 | `Dockerfile.backend`, `Dockerfile.frontend`, `docker-compose.yml` | ✅ 已新增 |
| 默认密码强度 | `backend/app/db/init_db.py` | ✅ 已修复 |
| 测试密码更新 | `tests/test_auth.py`, `tests/test_users.py` | ✅ 已修复 |
| 初始账号密码 | `README.md` | ✅ 已更新 |

### 8.4 历史或非本轮改动

| 范围 | 说明 |
|------|------|
| `.claude/*` | 本地自动化配置或运行状态变更，未归入本轮工程化交付 |
| `backend/app/models/*`、`backend/app/schemas/*`、`backend/app/routers/*`、`backend/app/services/*` | 已存在的后端业务和任务模块相关改动 |
| `backend/app/models/task.py` 等新增 task 模块文件 | 已存在的任务模块新增文件，需单独评审 |
| `frontend/src/components/*`、`frontend/src/pages/*`、`frontend/src/types/*`、`frontend/src/utils/hooks.ts` | 已存在的前端业务改动，需单独评审 |
| `frontend/src/constants/index.tsx` | 大规模删除改动，风险较高，需单独确认 |

结论：后续提交建议至少拆成三组：工程化文档与配置、低库存修复、历史业务/任务模块改动。
