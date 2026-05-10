# EventMaster Pro 前端

全生命周期活动管理平台前端，基于 React + TypeScript + Tailwind CSS + Vite。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router v7
- **图表**: Recharts
- **图标**: Lucide React
- **AI 服务**: Google Gemini API
- **认证**: JWT Token (自动携带在请求头中)

## 目录结构

```
src/
├── pages/              # 页面组件（路由级别）
│   ├── Dashboard.tsx         # 数据仪表盘
│   ├── Login.tsx            # 登录页
│   ├── Account.tsx          # 账号管理
│   ├── Permissions.tsx      # 权限管理
│   ├── Settings.tsx         # 网站设置
│   ├── ActivityDetail.tsx   # 活动详情
│   ├── MaterialDetail.tsx   # 物料详情
│   ├── SupplierDetail.tsx   # 供应商详情
│   ├── OpportunityDetail.tsx# 商机详情
│   └── ReviewDetail.tsx     # 复盘详情
├── components/         # 业务组件
│   ├── activity/       # 活动管理
│   ├── material/       # 物料管理
│   ├── budget/        # 预算管理
│   ├── supplier/       # 供应商管理
│   ├── opportunity/    # 商机管理
│   ├── review/         # 复盘管理
│   └── layout/         # 布局组件
├── shared/             # 共享组件（Card, Button, Modal 等）
├── services/           # API 服务
│   ├── backendApi.ts       # 后端 API 接口（自动携带 JWT）
│   ├── authApi.ts          # 认证 API
│   └── geminiService.ts    # AI 服务
├── context/            # 状态管理
│   └── AuthContext.tsx     # 认证状态管理
├── stores/             # 状态管理（AppContext）
├── utils/              # 工具函数
│   ├── routes.ts           # 路由配置
│   └── storage.ts          # localStorage 存储
├── constants/          # 常量定义
│   └── index.tsx          # NAV_ITEMS, SYSTEM_NAV_ITEMS
├── types/              # TypeScript 类型
└── hooks/              # 自定义 Hooks
```

## 路由规范

| 路径 | 组件 | 说明 |
|------|------|------|
| `/login` | Login | 登录页 |
| `/` | Dashboard | 数据仪表盘 |
| `/activities` | ActivityManager | 活动列表 |
| `/activities/:id` | ActivityDetail | 活动详情 |
| `/materials` | MaterialManager | 物料列表 |
| `/materials/:id` | MaterialDetail | 物料详情 |
| `/budget` | BudgetManager | 预算管理 |
| `/suppliers` | SupplierManager | 供应商列表 |
| `/suppliers/:id` | SupplierDetail | 供应商详情 |
| `/opportunities` | OpportunityManager | 商机列表 |
| `/opportunities/:id` | OpportunityDetail | 商机详情 |
| `/reviews` | ReviewCenter | 复盘列表 |
| `/reviews/:id` | ReviewDetail | 复盘详情 |
| `/account` | Account | 账号管理 |
| `/permissions` | Permissions | 权限管理 |
| `/settings` | Settings | 网站设置 |

## 权限模块

系统采用细粒度模块权限控制，支持 8 个模块 × 4 种操作（查看/创建/编辑/删除）：

| 模块 | 说明 |
|------|------|
| activities | 活动管理 |
| materials | 物料仓库 |
| budget | 预算管理 |
| suppliers | 供应商库 |
| leads | 商机转化 |
| reviews | 复盘中心 |
| account | 账号管理 |
| settings | 网站设置 |

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview -- --port 5173

# 运行测试
npm test -- --run
```

## 环境变量

```bash
VITE_API_BASE_URL=http://localhost:8001/api
GEMINI_API_KEY=your_gemini_api_key
```

`VITE_API_BASE_URL` 未配置时默认使用 `http://localhost:8001/api`。

## 样式规范

- **圆角**: `rounded-sm/md/lg/xl/2xl/full`
- **阴影**: `shadow-sm/md/lg/xl`
- **动画**: `duration-fast(150ms)/normal(200ms)/slow(300ms)`
- **间距**: `space-xs/sm/md/lg/xl`

详见 [tailwind.config.js](tailwind.config.js) 和 [src/index.css](src/index.css)

## API 请求自动携带 Token

`backendApi.ts` 会在每个请求自动从 localStorage 读取 `auth_token` 并添加到 Authorization header：

```typescript
// 请求示例
const response = await request('/activities');
// 自动携带: Authorization: Bearer <token>
```

401 响应时会自动清除 token 并重定向到登录页。

## 当前治理重点（2026-05-10）

- 前端不再作为 Gemini 敏感凭据持有端，需迁移为后端代理调用。
- `backendApi.ts` 将按领域逐步拆分，降低单文件复杂度。
- `fileApi` 需与后端能力对齐（实现或下线），避免死接口。
