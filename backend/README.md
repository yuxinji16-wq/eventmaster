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
| 认证 | JWT (jose) + bcrypt |

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
│   │   ├── review.py
│   │   ├── dashboard.py
│   │   ├── auth.py          # 认证 (登录/注册/当前用户)
│   │   ├── users.py         # 用户管理
│   │   ├── roles.py         # 角色权限管理
│   │   └── settings.py      # 网站设置
│   ├── core/             # 核心配置
│   │   ├── config.py     # 应用配置
│   │   └── security.py   # JWT 工具函数
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
│   │   ├── review.py
│   │   ├── user.py       # User, Role 模型
│   │   └── settings.py   # SiteSettings 模型
│   ├── repositories/     # 数据访问层 (Data Access)
│   │   ├── base.py       # Repository 基类
│   │   ├── activity.py
│   │   ├── material.py
│   │   ├── supplier.py
│   │   ├── budget.py
│   │   ├── opportunity.py
│   │   ├── review.py
│   │   ├── user.py       # UserRepository, RoleRepository
│   │   └── settings.py  # SettingsRepository
│   ├── schemas/          # Pydantic 模式 (Application)
│   │   ├── activity.py
│   │   ├── material.py
│   │   ├── supplier.py
│   │   ├── budget.py
│   │   ├── opportunity.py
│   │   ├── review.py
│   │   ├── user.py       # User/Role/Auth Schema
│   │   └── settings.py   # Settings Schema
│   ├── services/         # 业务逻辑层 (Business Logic)
│   │   ├── base.py       # Service 基类
│   │   ├── activity.py
│   │   ├── material.py
│   │   ├── supplier.py
│   │   ├── budget.py
│   │   ├── opportunity.py
│   │   ├── review.py
│   │   ├── user.py       # UserService, RoleService
│   │   └── settings.py   # SettingsService
│   └── main.py           # 应用入口
├── data/                 # SQLite 数据目录
└── requirements.txt
```

## 快速启动

```bash
# 安装依赖
pip install -r requirements.txt

# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
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

## API 端点

基础路径: `/api`

| 端点 | 方法 | 说明 |
|------|------|------|
| `/activities` | GET, POST | 活动列表/创建 |
| `/activities/{id}` | GET, PUT, DELETE | 活动详情操作 |
| `/budget/*` | GET, POST | 预算管理 |
| `/materials` | GET, POST | 物料管理 |
| `/suppliers` | GET, POST | 供应商管理 |
| `/opportunities` | GET, POST | 商机管理 |
| `/reviews` | GET, POST | 复盘管理 |
| `/dashboard/*` | GET | 仪表盘统计 |
| `/auth/login` | POST | 用户登录 |
| `/auth/register` | POST | 注册用户 |
| `/auth/me` | GET | 获取当前用户 |
| `/users` | GET, POST | 用户列表/创建 |
| `/users/{id}` | GET, PUT, DELETE | 用户详情操作 |
| `/users/permissions/me` | GET | 获取当前用户权限 |
| `/roles` | GET, POST | 角色列表/创建 |
| `/roles/{id}` | GET, PUT, DELETE | 角色详情操作 |
| `/settings` | GET, PUT | 网站设置 |
| `/settings/test-email` | POST | 测试邮件发送 |

## API 文档

启动后访问: http://localhost:8001/docs

## 测试

```bash
# 运行所有测试
python -m pytest tests/ -v

# 运行覆盖率
python -m pytest tests/ --cov=app
```
