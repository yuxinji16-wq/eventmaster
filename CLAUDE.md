# 项目协作规范

## 项目级原则
以下规则为本仓库强约束，任何开发、评审、自动化代理执行都必须遵守：

1. 文档先行：开始实现前，必须先创建或更新相关文档，明确目标、范围、接口或行为变化，然后才能修改代码。
2. SDD（Schema/需求驱动开发）：任务完成后必须同步至文档，文档与代码必须保持一致。
3. 优先维护已有文档：如无必要，禁止新增文档；优先更新现有文档，如 `README.md`、`backend/README.md`、`frontend/README.md`。
4. 中文优先：所有项目文档、代码注释、说明性提交内容均必须使用中文。
5. TDD 流程：先补充或编写测试，再实现代码；代码完成后必须执行对应测试，未验证不得视为完成。
6. 禁止未完成占位：禁止留下 `TODO`、伪实现、假数据占位或”后续补充”逻辑；需求范围内功能必须完整落地。
7. 禁止幻觉：不得虚构接口、配置、依赖、测试结果或上线状态；不确定时先查代码、配置和现有文档。
8. 前端预览优先：涉及前端页面、交互、样式或可视化输出的修改，完成实现后必须先提供预览方式并等待你确认，再继续收尾、扩展改动或合并交付。
9. 并行规划：规划任务时就考虑并行，能多开Agent时必须多开，充分利用并发能力提升效率。
10. 根因优先：修复问题时必须先定位根因，找到根本原因后再修改代码；禁止用试错方式盲目修复。
11. 数据只来自一处：生产环境数据必须只来自后端 API，不得依赖前端 localStorage 或其他本地缓存。
12. 前后端联动：修改功能时必须同时考虑前后端实现，涉及接口变更时先确认 API 路径、数据结构、前后端类型定义的一致性。

## 高频问题处理（Skills）

### API 路径匹配问题
当前后端 API 使用统一前缀 `/api`，前端 `backendApi.ts` 必须匹配：
- 后端路由：`/api/activities`、`/api/materials` 等
- 前端 API_BASE：`http://localhost:8001/api`
- 修改前必须确认前后端路径一致

### 数据持久化策略
- 开发环境可使用 localStorage 作为临时缓存
- 生产环境数据必须来自后端 API，localStorage 仅用于错误日志等非业务数据
- 新增/修改数据时，同时调用后端 API 和本地状态更新

## 仓库结构
- `src/`：主前端应用（EventMaster Pro）
- `frontend/`：另一套前端实现，视为独立变体
- `backend/`：FastAPI 后端

## 前端架构（src/）

### 目录规范
```
src/
├── pages/              # 页面组件（路由级别组件）
│   ├── Dashboard.tsx        # 数据仪表盘
│   ├── ActivityDetail.tsx   # 活动详情
│   ├── MaterialDetail.tsx   # 物料详情
│   ├── SupplierDetail.tsx   # 供应商详情
│   ├── OpportunityDetail.tsx# 商机详情
│   └── ReviewDetail.tsx     # 复盘详情
├── components/         # 业务组件（Manager 列表组件）
│   ├── activity/       # 活动管理
│   ├── material/       # 物料管理
│   ├── budget/         # 预算管理
│   ├── supplier/       # 供应商管理
│   ├── opportunity/    # 商机管理
│   ├── review/         # 复盘管理
│   └── layout/         # 布局组件
├── shared/             # 共享组件（Card, Button, Modal 等）
├── services/           # API 服务
│   ├── backendApi.ts       # 后端 API 接口
│   └── geminiService.ts    # AI 服务
├── stores/             # 状态管理
├── utils/              # 工具函数
│   ├── routes.ts           # 路由配置（统一管理）
│   └── storage.ts          # 存储工具
├── constants/          # 常量定义
├── types/              # TypeScript 类型定义
└── hooks/              # 自定义 Hooks
```

### 路由规范
- 列表页：`/xxx`（如 `/activities`）
- 详情页：`/xxx/:id`（如 `/activities/:id`）
- 所有路由定义在 `src/utils/routes.ts`

### 样式规范
- 圆角系统：`rounded-sm/md/lg/xl/2xl/full`
- 阴影系统：`shadow-sm/md/lg/xl`
- 过渡动画：`duration-fast(150ms)/normal(200ms)/slow(300ms)`
- 全局 CSS 变量定义在 `src/index.css`

## 开发与验证
- 前端构建：`cd frontend && npm run build`
- 前端预览：`cd frontend && npm run preview -- --port 5173`
- 前端开发：`cd frontend && npm run dev`
- 后端启动：`cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001`

涉及代码变更时，必须先补测试或明确现有测试入口，再完成实现并执行验证。

涉及前端改动时，默认流程为：先更新文档说明变更目标，再实现代码并提供本地预览入口。

## 提交与变更要求
- 提交信息使用中文，建议采用”动词 + 范围 + 结果”的简洁格式。
- 前端交付说明必须附带预览方式。

## 注释与实现要求
- 仅在必要处添加中文注释，注释应解释原因、约束或边界。
- 不允许提交未使用代码、调试残留、无效脚本或占位分支。
