# EventMaster Pro 产品规格说明书 (SPEC.md)

## 1. 项目概述与定位

### 1.1 项目名称
**EventMaster Pro** - 全生命周期活动管理平台

### 1.2 项目定位
面向企业市场部门的一站式活动全生命周期管理平台，覆盖活动策划、执行、复盘的全流程数字化管理，同时整合预算管理、物料管理、供应商管理和商机转化等核心业务模块。

### 1.3 核心价值
- **全流程覆盖**: 从活动规划、预算编制、执行跟踪到复盘总结的完整闭环
- **数据驱动决策**: 通过仪表盘实时洞察活动效果，优化营销ROI
- **资源集约管理**: 统一管理物料、供应商、预算等核心资源
- **团队协同效率**: 多角色、多部门的在线协作与评价体系

### 1.4 目标用户
- 市场部经理及活动策划人员
- 财务预算管理人员
- 供应商对接人员
- 活动执行团队成员
- 管理层决策者

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端框架 | React 18 + TypeScript | 组件化开发 |
| 构建工具 | Vite | 快速热更新 |
| 样式 | Tailwind CSS | 原子化CSS |
| 路由 | React Router v6 | 路由管理 |
| 图表 | Recharts | 数据可视化 |
| 后端框架 | FastAPI | 高性能API |
| 数据库 | SQLite | 轻量级数据库 |
| AI服务 | Google Gemini | 智能分析 |

### 2.2 前端目录结构

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
│   ├── activity/       # ActivityManager
│   ├── material/       # MaterialManager
│   ├── budget/        # BudgetManager
│   ├── supplier/       # SupplierManager
│   ├── opportunity/    # OpportunityManager
│   ├── review/         # ReviewCenter
│   └── layout/        # Layout, Sidebar
├── shared/             # 共享组件（Card, Button, Modal 等）
├── services/           # API 服务
│   ├── backendApi.ts       # 后端 API
│   └── geminiService.ts    # AI 服务
├── utils/              # 工具函数
│   ├── routes.ts           # 路由配置
│   └── storage.ts          # localStorage 存储
└── ...
```

---

## 3. 功能需求清单

### 3.1 活动管理模块

#### 3.1.1 活动基础信息管理
- 创建/编辑/删除活动记录
- 活动名称、日期、地点、类型、分类
- 活动状态流转：待启动 -> 进行中 -> 已完成/已取消

#### 3.1.2 活动视图与筛选
- 卡片视图与日历视图切换
- 按年份、月份、类型、状态筛选
- 关键词搜索功能

#### 3.1.3 活动详情扩展
- 媒体宣传记录
- 公众号文章列表
- 资料附件管理
- 费用明细登记

### 3.2 预算管理模块

#### 3.2.1 年度预算管理
- 年度预算配额设置
- 年度预算总览看板
- 预算使用率实时计算

#### 3.2.2 预算预警与分析
- 超预算预警（>100%执行率）
- 高风险预警（80%-100%执行率）
- ROI分析

### 3.3 物料管理模块

#### 3.3.1 物料基础信息
- 物料名称、分类、属性
- 库存状态：充足/预警/缺货

#### 3.3.2 入库/领用管理
- 新增物料类型入库
- 现有物料库存补充
- 物料领用登记

### 3.4 供应商管理模块

#### 3.4.1 供应商档案
- 公司名称、服务类型、评分
- 联系人、银行账户信息

#### 3.4.2 合作记录
- 合作历史账单
- 内部评价留言板

### 3.5 商机管理模块

#### 3.5.1 商机信息
- 客户名称、预计价值
- 商机状态：高意向/中意向/低意向

#### 3.5.2 转化跟踪
- 预计成交日期
- 关联活动来源

### 3.6 复盘中心模块

#### 3.6.1 复盘状态流转
- 未开始 -> 进行中 -> 待确认 -> 已完成

#### 3.6.2 多维度评价体系
- 目标达成度、线索质量、执行稳定性等
- AI复盘总结生成

### 3.7 数据仪表盘模块

#### 3.7.1 核心指标展示
- 年度总预算、累计潜客数、活动ROI

#### 3.7.2 可视化图表
- 月度预算/留资趋势图
- 活动类型分布饼图

---

## 4. 页面路由

### 4.1 路由定义

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

### 4.2 导航结构

```
├── 数据仪表盘 (Dashboard)
├── 活动管理 (ActivityManager)
├── 物料仓库 (MaterialManager)
├── 预算仓库 (BudgetManager)
├── 供应商库 (SupplierManager)
├── 商机转化 (OpportunityManager)
└── 复盘中心 (ReviewCenter)
```

---

## 5. 样式规范

### 5.1 圆角系统
- `rounded-sm`: 8px - 按钮、输入框
- `rounded-md`: 12px - 小卡片、徽章
- `rounded-lg`: 16px - 主卡片
- `rounded-xl`: 24px - 大卡片、模态框
- `rounded-2xl`: 32px - 特大卡片
- `rounded-full`: 胶囊形状

### 5.2 阴影系统
- `shadow-sm`: 浅阴影
- `shadow-md`: 中阴影
- `shadow-lg`: 深阴影
- `shadow-xl`: 特深阴影

### 5.3 动画系统
- `duration-fast`: 150ms
- `duration-normal`: 200ms
- `duration-slow`: 300ms

---

## 6. 预设数据与枚举值

### 6.1 活动状态
- 待启动 (PLANNED)
- 进行中 (ONGOING)
- 已完成 (COMPLETED)
- 已取消 (CANCELLED)

### 6.2 复盘状态
- 未开始 (NOT_STARTED)
- 进行中 (IN_PROGRESS)
- 待确认 (PENDING_CONFIRM)
- 已完成 (COMPLETED)

### 6.3 物料状态
- 充足 (In Stock)
- 预警 (Low Stock)
- 缺货 (Out of Stock)

### 6.4 商机意向等级
- 高意向
- 中意向
- 低意向

### 6.5 预算类别
- 场地租用
- 搭建/展览
- 物料制作
- 差旅/住宿
- 餐饮/招待
- 礼品/赠品
- 媒体/推广
- 人员费用
- 其他
