# EventMaster Pro

市场活动全生命周期管理平台，支持活动管理、预算管理、物料仓库、供应商库、商机转化和复盘分析。

## 项目结构

```
eventmaster-pro/
├── frontend/           # React + TypeScript 前端
│   ├── src/
│   │   ├── pages/         # 页面组件（Dashboard + 详情页）
│   │   ├── components/     # 业务组件（Manager）
│   │   ├── shared/         # 共享组件
│   │   ├── services/       # API 服务
│   │   ├── utils/          # 工具函数
│   │   └── ...
│   └── README.md
├── backend/            # FastAPI 后端
├── docs/              # 设计文档
│   ├── SPEC.md            # 需求规格
│   ├── DESIGN.md           # 设计文档
│   ├── PROGRESS.md         # 进度追踪
│   └── TASKS.md           # 任务列表
├── CLAUDE.md          # 项目协作规范
└── 开发文档.md         # 开发记录
```

## 技术栈

| 端 | 技术 |
|---|---|
| 前端 | React + TypeScript + Tailwind CSS + Vite + React Router v6 |
| 后端 | FastAPI + Python |
| 数据 | localStorage（前端）+ SQLite（后端） |
| AI | Google Gemini API |

## 快速启动

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 功能模块

| 模块 | 说明 |
|------|------|
| 活动管理 | 支持卡片/日历双视图，活动详情含预算、费用、复盘等 |
| 预算管理 | 年度预算分析、活动预算跟踪、超支预警 |
| 物料仓库 | 库存管理、入库/领用记录、支持自定义分类 |
| 供应商库 | 供应商档案管理、合作评价、账单流水 |
| 商机转化 | 商机状态跟踪、预计成交、ROI 分析 |
| 复盘中心 | 活动复盘评价、AI 洞察生成、团队反馈汇总 |
| 数据仪表盘 | 活动统计、预算概览、趋势分析 |

## 环境变量

前端 `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key
```

## 文档

- [前端文档](frontend/README.md)
- [协作规范](CLAUDE.md)
- [需求规格](docs/SPEC.md)
- [设计文档](docs/DESIGN.md)
- [进度追踪](docs/PROGRESS.md)
- [任务列表](docs/TASKS.md)
