# EventMaster Pro 前端

全生命周期活动管理平台前端，基于 React + TypeScript + Tailwind CSS + Vite。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router v6
- **图表**: Recharts
- **图标**: Lucide React
- **AI 服务**: Google Gemini API

## 目录结构

```
src/
├── pages/              # 页面组件（路由级别）
│   ├── Dashboard.tsx         # 数据仪表盘
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
│   ├── backendApi.ts       # 后端 API 接口
│   └── geminiService.ts    # AI 服务
├── stores/             # 状态管理（AppContext）
├── utils/              # 工具函数
│   ├── routes.ts           # 路由配置
│   └── storage.ts          # localStorage 存储
├── constants/          # 常量定义
├── types/              # TypeScript 类型
├── hooks/              # 自定义 Hooks
└── index.css           # 全局样式
```

## 路由规范

| 路径 | 组件 | 说明 |
|------|------|------|
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
```

## 环境变量

```bash
GEMINI_API_KEY=your_gemini_api_key
```

## 样式规范

- **圆角**: `rounded-sm/md/lg/xl/2xl/full`
- **阴影**: `shadow-sm/md/lg/xl`
- **动画**: `duration-fast(150ms)/normal(200ms)/slow(300ms)`
- **间距**: `space-xs/sm/md/lg/xl`

详见 [tailwind.config.js](tailwind.config.js) 和 [src/index.css](src/index.css)
