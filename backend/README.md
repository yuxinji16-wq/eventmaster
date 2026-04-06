# EventMaster Pro Backend

市场活动全生命周期管理平台后端 API 服务

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | FastAPI 0.109+ |
| ORM | SQLAlchemy 2.0 |
| 数据库 | SQLite / MySQL (通过 DATABASE_URL 切换) |
| 验证 | Pydantic v2 |
| 迁移 | Alembic |
| 异步 | Uvicorn |

## 分层架构

```
backend/
├── app/
│   ├── routers/          # API 路由层 (Presentation)
│   │   ├── activity.py
│   │   ├── material.py
│   │   ├── supplier.py
│   │   ├── budget.py
│   │   ├── opportunity.py
│   │   └── review.py
│   ├── core/             # 核心配置
│   │   └── config.py     # 应用配置
│   ├── db/               # 数据库配置
│   │   ├── base.py       # Base 类和 TimestampMixin
│   │   ├── session.py    # 会话管理
│   │   └── init_db.py    # 数据库初始化
│   ├── models/           # SQLAlchemy 模型 (Domain)
│   │   ├── activity.py
│   │   ├── material.py
│   │   ├── supplier.py
│   │   ├── budget.py
│   │   ├── opportunity.py
│   │   └── review.py
│   ├── repositories/     # 数据访问层 (Data Access)
│   │   ├── base.py       # Repository 基类
│   │   ├── activity.py
│   │   ├── material.py
│   │   └── ...
│   ├── schemas/          # Pydantic 模式 (Application)
│   │   ├── activity.py
│   │   ├── material.py
│   │   └── ...
│   ├── services/         # 业务逻辑层 (Business Logic)
│   │   ├── base.py       # Service 基类
│   │   ├── activity.py
│   │   ├── material.py
│   │   └── ...
│   └── main.py           # 应用入口
├── data/                 # SQLite 数据目录
└── requirements.txt
```

## 快速启动

```bash
# 安装依赖
pip install -r requirements.txt

# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 环境变量

```bash
# .env
DATABASE_URL=sqlite:///./data/eventmaster.db
# 切换 MySQL
# DATABASE_URL=mysql+pymysql://user:pass@localhost/eventmaster

SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
GOOGLE_API_KEY=your_gemini_api_key
```

## API 文档

启动后访问: http://localhost:8000/docs
