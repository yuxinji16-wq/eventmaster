# EventMaster Pro 技术方案设计 (DESIGN.md)

## 1. 技术架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端 (Client)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   React 单页应用                          │  │
│  │  ┌─────────────┐  ┌─────────────┐                     │  │
│  │  │   pages/    │  │ components/ │                     │  │
│  │  │  Dashboard  │  │ ActivityMgr │                     │  │
│  │  │  Detail页   │  │ MaterialMgr  │                     │  │
│  │  │  (路由级)   │  │ BudgetMgr   │  (Manager列表级)     │  │
│  │  └─────────────┘  └─────────────┘                     │  │
│  │                        │                                │  │
│  │  ┌──────────────────────────────────────────────┐      │  │
│  │  │              shared/ (共享组件)                 │      │  │
│  │  │         Card, Button, Modal, Badge            │      │  │
│  │  └──────────────────────────────────────────────┘      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST API
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                         服务端 (Server)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    FastAPI Web Framework               │  │
│  │   /activities  /budget  /materials  /suppliers       │  │
│  │   /opportunities  /reviews  /dashboard               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术选型 | 版本 | 说明 |
|------|---------|------|------|
| 前端框架 | React | 19.x | 组件化开发，虚拟DOM |
| 构建工具 | Vite | 6.x | 快速热更新，生产优化 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 4.x | 原子化CSS |
| 路由 | React Router | 7.x | 声明式路由 |
| 图表库 | Recharts | 2.x | React原生图表 |
| 状态管理 | React Context | 内置 | 轻量级状态共享 |
| 后端框架 | FastAPI | 0.109.x | 高性能，自动文档 |
| 数据库 | SQLite | 3.x | 轻量级，零配置 |
| AI服务 | Google Gemini | - | 营销洞察生成 |

---

## 2. 前端架构

### 2.1 目录结构

```
frontend/src/
├── pages/                    # 页面组件（路由级别）
│   ├── Dashboard.tsx         # 数据仪表盘
│   ├── Login.tsx            # 登录页
│   ├── Account.tsx           # 账号管理
│   ├── Permissions.tsx      # 权限管理
│   ├── Settings.tsx         # 网站设置
│   ├── ActivityDetail.tsx    # 活动详情
│   ├── MaterialDetail.tsx     # 物料详情
│   ├── SupplierDetail.tsx    # 供应商详情
│   ├── OpportunityDetail.tsx# 商机详情
│   └── ReviewDetail.tsx      # 复盘详情
├── components/               # 业务组件（Manager 列表组件）
│   ├── activity/             # ActivityManager（列表）
│   ├── material/             # MaterialManager（列表）
│   ├── budget/              # BudgetManager（混合）
│   ├── supplier/            # SupplierManager（列表）
│   ├── opportunity/          # OpportunityManager（列表）
│   ├── review/              # ReviewCenter（列表）
│   └── layout/              # Layout, Sidebar
├── shared/                   # 共享组件
│   └── index.tsx            # Card, Button, Modal, Badge, StatCard
├── services/                 # API 服务
│   ├── backendApi.ts         # 后端 API（自动携带 JWT）
│   ├── authApi.ts            # 认证 API
│   └── geminiService.ts      # AI 服务
├── context/                   # 状态管理
│   └── AuthContext.tsx       # 认证状态管理
├── stores/                   # 状态管理
│   └── AppContext.tsx        # 全局状态
├── utils/                    # 工具函数
│   ├── routes.ts             # 路由配置（统一管理）
│   └── storage.ts            # localStorage 存储
├── constants/                # 常量定义
│   └── index.tsx            # NAV_ITEMS, SYSTEM_NAV_ITEMS
├── types/                    # TypeScript 类型
│   └── index.tsx
├── hooks/                    # 自定义 Hooks
│   └── index.ts
└── index.css                # 全局样式变量
```

### 2.2 组件职责划分

| 目录 | 组件类型 | 职责 |
|------|---------|------|
| `pages/` | 页面组件 | 路由级别的完整页面，通常包含单个 Manager 或详情 |
| `components/` | 业务组件 | 列表管理组件（Manager），包含 CRUD、筛选、弹窗等 |
| `shared/` | 共享组件 | 可复用的 UI 组件，如 Card、Button、Modal |

### 2.3 路由结构

```typescript
// src/utils/routes.ts
export const Routes = {
  HOME: '/',
  LOGIN: '/login',
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',
  MATERIALS: '/materials',
  MATERIAL_DETAIL: '/materials/:id',
  BUDGET: '/budget',
  SUPPLIERS: '/suppliers',
  SUPPLIER_DETAIL: '/suppliers/:id',
  OPPORTUNITIES: '/opportunities',
  OPPORTUNITY_DETAIL: '/opportunities/:id',
  REVIEWS: '/reviews',
  REVIEW_DETAIL: '/reviews/:id',
  ACCOUNT: '/account',
  PERMISSIONS: '/permissions',
  SETTINGS: '/settings',
};
```

### 2.4 状态管理

```
AppContext (根上下文)
    │
    └── 全局状态（认证、主题等）

Manager 组件内部状态:
    └── useState / useMemo / useCallback

详情页组件:
    └── useParams 获取路由参数
    └── useNavigate 导航
```

### 2.5 样式规范

**CSS 变量 (index.css)**
```css
:root {
  --radius-sm: 0.5rem;    /* 8px */
  --radius-md: 0.75rem;   /* 12px */
  --radius-lg: 1rem;        /* 16px */
  --radius-xl: 1.5rem;     /* 24px */
  --radius-2xl: 2rem;     /* 32px */

  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

**Tailwind 扩展 (tailwind.config.js)**
```js
borderRadius: {
  'sm': '0.5rem',
  'md': '0.75rem',
  'lg': '1rem',
  'xl': '1.5rem',
  '2xl': '2rem',
  'full': '9999px',
},
boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
},
```

---

## 3. 后端架构

### 3.1 API 设计

**API 基础路径**: `/api`

| 资源 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 活动 | `/activities` | GET, POST | 获取列表/创建活动 |
| 活动 | `/activities/{id}` | GET, PUT, DELETE | 单个活动操作 |
| 预算 | `/budget/logs` | GET, POST | 预算日志 |
| 物料 | `/materials` | GET, POST | 物料管理 |
| 供应商 | `/suppliers` | GET, POST | 供应商管理 |
| 商机 | `/opportunities` | GET, POST | 商机管理 |
| 复盘 | `/reviews` | GET, POST | 复盘管理 |
| 仪表盘 | `/dashboard/stats` | GET | 仪表盘统计 |
| 认证 | `/auth/login` | POST | 用户登录 |
| 用户 | `/users` | GET, POST | 用户列表/创建 |
| 角色 | `/roles` | GET, POST | 角色列表/创建 |
| 设置 | `/settings` | GET, PUT | 网站设置 |

### 3.2 后端目录结构

```
backend/
├── app/
│   ├── main.py                 # 应用入口
│   ├── config.py               # 配置管理
│   ├── routers/
│   │   ├── activities.py       # 活动路由
│   │   ├── budget.py          # 预算路由
│   │   ├── materials.py       # 物料路由
│   │   ├── suppliers.py       # 供应商路由
│   │   ├── opportunities.py   # 商机路由
│   │   ├── reviews.py         # 复盘路由
│   │   ├── dashboard.py        # 仪表盘路由
│   │   ├── auth.py            # 认证路由
│   │   ├── users.py           # 用户管理路由
│   │   ├── roles.py           # 角色权限路由
│   │   └── settings.py        # 网站设置路由
│   ├── models/
│   │   ├── activity.py
│   │   ├── budget.py
│   │   ├── material.py
│   │   ├── supplier.py
│   │   ├── opportunity.py
│   │   ├── review.py
│   │   ├── user.py            # User, Role 模型
│   │   └── settings.py        # SiteSettings 模型
│   └── data/                   # SQLite 数据目录
```

---

## 4. 命名规范

### 4.1 文件命名
- React 组件: PascalCase (如 `ActivityManager.tsx`)
- 页面组件: PascalCase (如 `ActivityDetail.tsx`)
- 工具函数: camelCase (如 `storage.ts`)
- 常量: PascalCase 或 UPPER_SNAKE_CASE

### 4.2 组件命名
- Manager 组件: `XxxManager` (如 `ActivityManager`)
- 详情组件: `XxxDetail` (如 `ActivityDetail`)
- 共享组件: PascalCase (如 `StatCard`)

---

## 5. 关键算法

### 5.1 预算执行率
```typescript
const executionRate = budget > 0 ? (actualSpend / budget) * 100 : 0;
```

### 5.2 库存状态
```typescript
if (stock === 0) return 'Out of Stock';
if (stock < 10) return 'Low Stock';
return 'In Stock';
```

### 5.3 ROI 计算
```typescript
const roi = spend > 0 ? (leads / (spend / 10000)) : 0;
```

---

## 6. 环境变量

### 前端 (.env.local)
```
GEMINI_API_KEY=your_gemini_api_key
```

### 后端 (.env)
```
APP_NAME=EventMaster Pro
DATABASE_URL=sqlite:///./data/eventmaster.db
GEMINI_API_KEY=your_api_key
```

---

## 7. 开发命令

```bash
# 前端
cd frontend
npm install
npm run dev      # 开发模式
npm run build     # 生产构建
npm run preview   # 预览构建结果

# 后端
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

---

## 8. 账号权限模块

### 8.1 模块概述

账号权限模块实现细粒度模块权限控制，支持按用户/角色分配不同模块的查看/编辑/删除权限。

### 8.2 数据模型

#### User 模型
```
User:
  - id: int (PK, 自增)
  - username: str (唯一, 索引)
  - email: str (唯一, 索引)
  - password_hash: str
  - is_active: bool (默认 true)
  - is_superadmin: bool (默认 false)
  - role_id: int (FK -> Role.id, 可为空)
  - created_at: datetime
  - updated_at: datetime
```

#### Role 模型
```
Role:
  - id: int (PK, 自增)
  - name: str (唯一) - 如"管理员"、"运营"、"查看者"
  - description: str
  - permissions: JSON - 权限规则
  - is_default: bool (默认 false)
  - created_at: datetime
  - updated_at: datetime
```

#### Permission 权限结构 (JSON)
```json
{
  "activities": {"view": true, "create": true, "edit": true, "delete": false},
  "materials": {"view": true, "create": true, "edit": true, "delete": false},
  "budget": {"view": true, "create": false, "edit": false, "delete": false},
  "suppliers": {"view": true, "create": true, "edit": true, "delete": true},
  "leads": {"view": true, "create": true, "edit": true, "delete": true},
  "reviews": {"view": true, "create": true, "edit": false, "delete": false},
  "account": {"view": true, "create": false, "edit": false, "delete": false},
  "settings": {"view": false, "create": false, "edit": false, "delete": false}
}
```

### 8.3 API 端点

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/auth/login` | POST | 用户登录 | 公开 |
| `/auth/register` | POST | 注册用户 | 管理员 |
| `/auth/me` | GET | 获取当前用户 | 需登录 |
| `/users` | GET | 用户列表 | 管理员 |
| `/users` | POST | 创建用户 | 管理员 |
| `/users/{id}` | PUT | 更新用户 | 管理员 |
| `/users/{id}` | DELETE | 删除用户 | 管理员 |
| `/roles` | GET | 角色列表 | 管理员 |
| `/roles` | POST | 创建角色 | 管理员 |
| `/roles/{id}` | PUT | 更新角色权限 | 管理员 |
| `/roles/{id}` | DELETE | 删除角色 | 管理员 |
| `/permissions/me` | GET | 获取当前用户权限 | 需登录 |

### 8.4 后端目录结构

```
backend/app/
├── models/
│   └── user.py           # User, Role 模型
├── schemas/
│   └── user.py           # User/Role Schema
├── repositories/
│   └── user.py           # UserRepository, RoleRepository
├── services/
│   └── user.py           # UserService, RoleService
├── routers/
│   ├── auth.py           # 认证路由
│   ├── users.py          # 用户管理路由
│   └── roles.py          # 角色权限路由
└── core/
    └── security.py       # JWT 工具函数
```

### 8.5 前端目录结构

```
frontend/src/
├── pages/
│   ├── Account.tsx       # 账号管理页面
│   └── Permissions.tsx  # 权限管理页面
├── components/
│   ├── account/
│   │   ├── AccountManager.tsx    # 账号管理组件
│   │   └── PermissionMatrix.tsx  # 权限矩阵组件
│   └── settings/
│       └── SettingsPanel.tsx      # 设置面板组件
├── services/
│   └── authApi.ts        # 认证 API
├── context/
│   └── AuthContext.tsx   # 认证状态管理
└── types/
    └── index.tsx         # 新增 User, Role 类型
```

---

## 9. 网站设置模块

### 9.1 模块概述

网站设置模块用于配置网站基础信息和邮件/通知设置。

### 9.2 数据模型

#### SiteSettings 模型
```
SiteSettings:
  - id: int (PK, 自增)
  - site_name: str (默认 "EventMaster Pro")
  - site_logo: str (URL, 可为空)
  - contact_email: str
  - contact_phone: str
  - address: str
  - smtp_host: str
  - smtp_port: int (默认 587)
  - smtp_username: str
  - smtp_password: str (加密存储)
  - smtp_from_email: str
  - email_template: Text
  - created_at: datetime
  - updated_at: datetime
```

### 9.3 API 端点

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/settings` | GET | 获取所有设置 | 管理员 |
| `/settings` | PUT | 更新设置 | 管理员 |
| `/settings/test-email` | POST | 发送测试邮件 | 管理员 |

### 9.4 后端目录结构

```
backend/app/
├── models/
│   └── settings.py       # SiteSettings 模型
├── schemas/
│   └── settings.py       # SettingsSchema
├── services/
│   └── settings.py       # SettingsService
└── routers/
    └── settings.py       # 设置路由
```

---

## 10. 安全设计

### 10.1 密码存储
- 使用 bcrypt 哈希算法
- 每次哈希使用随机 salt
- 不存储明文密码

### 10.2 JWT Token
- 算法: HS256
- 过期时间: 24 小时
- Payload: `{user_id, username, role_id, exp}`

### 10.3 权限检查流程
```
请求 -> JWT验证 -> 获取用户 -> 获取角色 -> 检查权限 -> 允许/拒绝
```

### 10.4 敏感信息加密
- SMTP 密码使用 Fernet 对称加密
- 密钥存储在环境变量中

---

## 11. 设计级技术债务与改造顺序（2026-05-10）

1. 鉴权与权限边界：将业务路由权限校验从“部分覆盖”提升为“默认强校验”。
2. AI 调用链路：前端直连模型改为后端代理，前端只传业务参数。
3. 数据库演进：从启动时动态修补转为标准迁移（Alembic）。
4. API 分层：前端 `backendApi.ts` 按领域拆分，降低耦合。
5. 观测能力：在现有日志基础上补齐指标、追踪与告警。
