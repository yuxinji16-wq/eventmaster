"""
数据库初始化
"""
import os
from datetime import datetime
from sqlalchemy import text
from app.db.base import Base
from app.db.session import engine, get_db


def init_db():
    """初始化数据库，创建所有表"""
    # 确保数据目录存在
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    os.makedirs(data_dir, exist_ok=True)

    # 导入所有模型以确保它们被注册
    from app.models import activity, task, material, supplier, budget, opportunity, review, user, settings

    # 创建所有表
    Base.metadata.create_all(bind=engine)
    ensure_schema_updates()

    # 创建默认管理员账号
    create_default_admin()

    # 创建示例数据
    create_sample_data()


def ensure_schema_updates():
    """为 SQLite 开发库补齐新增列。生产环境应使用 Alembic 迁移。"""
    if not engine.url.drivername.startswith("sqlite"):
        return

    table_columns = {
        "materials": {
            "image_url": "VARCHAR(500)",
        },
        "withdrawal_logs": {
            "activity_id": "INTEGER",
            "status": "VARCHAR(20) DEFAULT '领用中'",
            "returned_at": "VARCHAR(20)",
            "return_count": "FLOAT DEFAULT 0",
        },
        "budget_logs": {
            "planned_amount": "FLOAT DEFAULT 0",
        },
        "supplier_reviews": {
            "reviewer_name": "VARCHAR(100)",
        },
        "bills": {
            "activity_name": "VARCHAR(200)",
            "project_name": "VARCHAR(200)",
        },
        "opportunities": {
            "lead_level": "VARCHAR(20) DEFAULT '待评估'",
            "evaluation_note": "TEXT",
            "transferred_to_sales": "VARCHAR(10) DEFAULT 'false'",
            "transferred_at": "VARCHAR(30)",
            "converted": "VARCHAR(10) DEFAULT 'false'",
            "conversion_status": "VARCHAR(20)",
            "conversion_at": "VARCHAR(30)",
            "result_note": "TEXT",
        },
    }

    with engine.begin() as conn:
        for table, columns in table_columns.items():
            existing = {row[1] for row in conn.execute(text(f"PRAGMA table_info({table})")).fetchall()}
            for column, column_type in columns.items():
                if column not in existing:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {column_type}"))


def create_default_admin():
    """创建默认管理员账号（幂等操作）"""
    from app.models.user import User
    from app.core.security import get_password_hash

    db = next(get_db())
    try:
        # 检查是否已存在 admin 用户
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if not existing_admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                # SECURITY: 默认密码符合强度要求（大写+小写+数字，8位以上）
                password_hash=get_password_hash("Admin123"),
                is_active=True,
                is_superadmin=True,
            )
            db.add(admin)
            db.commit()
            print("Admin account created (admin / Admin123)")
        else:
            print("Admin account already exists")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin: {e}")
    finally:
        db.close()


def create_sample_data():
    """创建示例数据"""
    from app.models.activity import Activity
    from app.models.material import Material
    from app.models.supplier import Supplier
    from app.models.opportunity import Opportunity
    from app.models.budget import BudgetLog

    db = next(get_db())
    try:
        # 检查是否已有数据
        existing_activities = db.query(Activity).count()
        if existing_activities > 0:
            print(f"Database has {existing_activities} activities, skipping sample data")
            return

        print("Creating sample data...")

        # 1. 创建示例活动
        activities_data = [
            {
                "name": "2024 全球科技峰会",
                "date": "2024-03-15",
                "location": "上海世博展览馆",
                "type": "Exhibition",
                "category": "自办活动",
                "industry": "综合",
                "budget": 500000,
                "actual_spend": 485000,
                "leads": 120,
                "status": "已完成",
                "description": "年度最大的品牌曝光活动，全球超过500家展商参展",
            },
            {
                "name": "华东区合作伙伴大会",
                "date": "2024-06-20",
                "location": "杭州滨江银泰喜来登酒店",
                "type": "Conference",
                "category": "自办活动",
                "industry": "综合",
                "budget": 200000,
                "actual_spend": 185000,
                "leads": 85,
                "status": "已完成",
                "description": "深耕区域渠道，发布Q3新政策",
            },
            {
                "name": "AI 产品路演 - 北京站",
                "date": "2024-04-10",
                "location": "北京国际会议中心",
                "type": "Roadshow",
                "category": "渠道活动",
                "industry": "电子信息",
                "budget": 150000,
                "actual_spend": 142000,
                "leads": 65,
                "status": "已完成",
                "description": "AI新品首发路演",
            },
            {
                "name": "数字化营销研讨会",
                "date": "2024-05-18",
                "location": "深圳星河丽思卡尔顿酒店",
                "type": "Seminar",
                "category": "自办活动",
                "industry": "综合",
                "budget": 80000,
                "actual_spend": 75000,
                "leads": 45,
                "status": "已完成",
                "description": "与行业协会联合举办的数字化转型研讨会",
            },
            {
                "name": "年度战略峰会",
                "date": "2024-02-28",
                "location": "三亚亚特兰蒂斯酒店",
                "type": "Summit",
                "category": "自办活动",
                "industry": "综合",
                "budget": 350000,
                "actual_spend": 340000,
                "leads": 30,
                "status": "已完成",
                "description": "年度战略发布及客户答谢会",
            },
            {
                "name": "新产品发布会",
                "date": "2024-07-05",
                "location": "上海世博中心",
                "type": "Conference",
                "category": "自办活动",
                "industry": "综合",
                "budget": 280000,
                "actual_spend": 0,
                "leads": 0,
                "status": "待启动",
                "description": "下一代产品全球首发",
            },
            {
                "name": "2025 春季新品发布会",
                "date": "2025-03-20",
                "location": "深圳国际会展中心",
                "type": "Conference",
                "category": "自办活动",
                "industry": "综合",
                "budget": 600000,
                "actual_spend": 580000,
                "leads": 150,
                "status": "已完成",
                "description": "春季新品全球首发",
            },
            {
                "name": "智能制造行业峰会",
                "date": "2025-05-15",
                "location": "北京国家会议中心",
                "type": "Summit",
                "category": "自办活动",
                "industry": "电子信息",
                "budget": 400000,
                "actual_spend": 385000,
                "leads": 95,
                "status": "已完成",
                "description": "智能制造行业解决方案分享",
            },
        ]

        for a_data in activities_data:
            year = str(datetime.strptime(a_data["date"], "%Y-%m-%d").year)
            activity = Activity(**a_data, year=year)
            db.add(activity)

        db.commit()
        print(f"Created {len(activities_data)} activities")

        # 2. 创建示例物料
        materials_data = [
            {"name": "AI产品白皮书 2024版", "category": "产品宣传册", "type": "常规", "stock": 450, "unit": "本", "usage_count": 1200},
            {"name": "公司宣传折页", "category": "产品宣传册", "type": "常规", "stock": 2000, "unit": "张", "usage_count": 3500},
            {"name": "品牌易拉宝", "category": "易拉宝", "type": "常规", "stock": 25, "unit": "个", "usage_count": 15},
            {"name": "定制商务礼品笔", "category": "礼品", "type": "定制", "stock": 500, "unit": "支", "usage_count": 200},
            {"name": "会议签到本", "category": "会议定制", "type": "定制", "stock": 150, "unit": "本", "usage_count": 50},
            {"name": "品牌手提袋", "category": "礼品", "type": "常规", "stock": 300, "unit": "个", "usage_count": 150},
            {"name": "名片夹", "category": "礼品", "type": "定制", "stock": 200, "unit": "个", "usage_count": 80},
        ]

        for m_data in materials_data:
            status = "In Stock" if m_data["stock"] > 0 else "Out of Stock"
            material = Material(**m_data, status=status)
            db.add(material)

        db.commit()
        print(f"Created {len(materials_data)} materials")

        # 3. 创建示例供应商
        import json
        suppliers_data = [
            {"name": "上海禾松文化传播有限公司", "category": "搭建", "rating": 4.8, "contact": "陈松", "phone": "138-1234-5678", "email": "chensong@example.com", "tags": json.dumps(["自有工厂", "工艺精湛"]), "order_count": 5},
            {"name": "北京零点视觉设计中心", "category": "设计", "rating": 4.5, "contact": "林悦", "phone": "139-8888-9999", "email": "linyue@example.com", "tags": json.dumps(["创意感强", "排版专业"]), "order_count": 3},
            {"name": "广州恒美印刷有限公司", "category": "印刷", "rating": 4.6, "contact": "王明", "phone": "136-5555-6666", "email": "wangming@example.com", "tags": json.dumps(["速度快", "质量好"]), "order_count": 8},
            {"name": "深圳星光AV设备租赁", "category": "设备", "rating": 4.7, "contact": "张华", "phone": "135-7777-8888", "email": "zhanghua@example.com", "tags": json.dumps(["设备先进", "服务周到"]), "order_count": 4},
        ]

        for s_data in suppliers_data:
            supplier = Supplier(**s_data)
            db.add(supplier)

        db.commit()
        print(f"Created {len(suppliers_data)} suppliers")

        # 4. 创建示例商机
        opportunities_data = [
            {"client_name": "全球电子集团", "company": "全球电子集团股份有限公司", "estimated_value": 1200000, "status": "方案报价", "field": "电子信息"},
            {"client_name": "未来科技研究院", "company": "未来科技研究院", "estimated_value": 800000, "status": "商务谈判", "field": "综合"},
            {"client_name": "智慧城市解决方案公司", "company": "智慧城市解决方案有限公司", "estimated_value": 500000, "status": "需求确认", "field": "电子信息"},
            {"client_name": "国际物流巨头", "company": "国际物流集团有限公司", "estimated_value": 350000, "status": "初步接触", "field": "综合"},
            {"client_name": "头部金融机构", "company": "中国银行某分行", "estimated_value": 2000000, "status": "方案报价", "field": "综合"},
        ]

        for i, o_data in enumerate(opportunities_data):
            opportunity = Opportunity(**o_data, activity_id=1 if i < 3 else None)
            db.add(opportunity)

        db.commit()
        print(f"Created {len(opportunities_data)} opportunities")

        # 5. 创建示例预算日志
        budget_logs_data = [
            {"name": "展台物料运费", "amount": 3500, "category": "物流/运费", "notes": "上海至拉斯维加斯空运", "status": "已结清", "type": "expense"},
            {"name": "酒店预订费用", "amount": 8500, "category": "酒店/餐饮", "notes": "峰会期间3晚住宿", "status": "已结清", "type": "expense"},
            {"name": "场地租赁费", "amount": 45000, "category": "场地", "notes": "会议中心全天租用", "status": "已结清", "type": "expense"},
            {"name": "AV设备租赁", "amount": 12000, "category": "设备", "notes": "音响灯光投影设备", "status": "待付款", "type": "expense"},
            {"name": "印刷物料费", "amount": 8500, "category": "印刷", "notes": "宣传册和易拉宝", "status": "已结清", "type": "expense"},
        ]

        for b_data in budget_logs_data:
            budget_log = BudgetLog(**b_data, activity_id=1, date="2024-03-10")
            db.add(budget_log)

        db.commit()
        print(f"Created {len(budget_logs_data)} budget logs")

        print("\nSample data initialization complete!")

    except Exception as e:
        db.rollback()
        print(f"Error creating sample data: {e}")
        raise
    finally:
        db.close()
