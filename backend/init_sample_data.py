"""
初始化示例数据到数据库
"""
import os
import sys

# 添加 backend 目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
from models import Activity, Material, Supplier, Opportunity, BudgetLog
from datetime import datetime, timedelta

def create_sample_data():
    """创建示例数据"""
    db = SessionLocal()
    
    try:
        # 检查是否已有数据
        existing_activities = db.query(Activity).count()
        if existing_activities > 0:
            print(f"数据库已有 {existing_activities} 个活动，跳过初始化")
            return
        
        print("正在创建示例数据...")
        
        # 1. 创建示例活动
        activities_data = [
            {
                "name": "2024 全球科技峰会",
                "date": "2024-03-15",
                "location": "上海世博展览馆",
                "type": "Exhibition",
                "category": "自办活动",
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
                "budget": 280000,
                "actual_spend": 0,
                "leads": 0,
                "status": "待启动",
                "description": "下一代产品全球首发",
            },
        ]
        
        for a_data in activities_data:
            year = str(datetime.strptime(a_data["date"], "%Y-%m-%d").year)
            activity = Activity(**a_data, year=year)
            db.add(activity)
        
        db.commit()
        print(f"创建了 {len(activities_data)} 个活动")
        
        # 2. 创建示例物料
        materials_data = [
            {"name": "AI产品白皮书 2024版", "category": "产品宣传册", "type": "常规", "stock": 450, "unit": "本", "usage_count": 1200},
            {"name": "公司宣传折页", "category": "产品宣传册", "type": "常规", "stock": 2000, "unit": "张", "usage_count": 3500},
            {"name": "品牌易拉宝", "category": "易拉宝", "type": "常规", "stock": 25, "unit": "个", "usage_count": 15},
            {"name": "定制商务礼品笔", "category": "礼品", "type": "定制", "stock": 500, "unit": "支", "usage_count": 200},
            {"name": "会议签到本", "category": "会议定制", "type": "定制", "stock": 150, "unit": "本", "usage_count": 50},
        ]
        
        for m_data in materials_data:
            status = "In Stock" if m_data["stock"] > 0 else "Out of Stock"
            material = Material(**m_data, status=status)
            db.add(material)
        
        db.commit()
        print(f"创建了 {len(materials_data)} 个物料")
        
        # 3. 创建示例供应商
        suppliers_data = [
            {"name": "上海禾松文化传播有限公司", "service_type": "搭建", "rating": 4.8, "contact": "陈松", "phone": "138-1234-5678", "tags": ["自有工厂", "工艺精湛"], "order_count": 5},
            {"name": "北京零点视觉设计中心", "service_type": "设计", "rating": 4.5, "contact": "林悦", "phone": "139-8888-9999", "tags": ["创意感强", "排版专业"], "order_count": 3},
            {"name": "广州恒美印刷有限公司", "service_type": "印刷", "rating": 4.6, "contact": "王明", "phone": "136-5555-6666", "tags": ["速度快", "质量好"], "order_count": 8},
            {"name": "深圳星光AV设备租赁", "service_type": "设备", "rating": 4.7, "contact": "张华", "phone": "135-7777-8888", "tags": ["设备先进", "服务周到"], "order_count": 4},
        ]
        
        for s_data in suppliers_data:
            supplier = Supplier(**s_data)
            db.add(supplier)
        
        db.commit()
        print(f"创建了 {len(suppliers_data)} 个供应商")
        
        # 4. 创建示例商机
        opportunities_data = [
            {"client_name": "全球电子集团", "value": 1200000, "stage": "方案报价", "probability": 60},
            {"client_name": "未来科技研究院", "value": 800000, "stage": "商务谈判", "probability": 80},
            {"client_name": "智慧城市解决方案公司", "value": 500000, "stage": "需求确认", "probability": 40},
            {"client_name": "国际物流巨头", "value": 350000, "stage": "初步接触", "probability": 20},
            {"client_name": "头部金融机构", "value": 2000000, "stage": "方案报价", "probability": 70},
        ]
        
        for o_data in opportunities_data:
            opportunity = Opportunity(**o_data, activity_id=1)
            db.add(opportunity)
        
        db.commit()
        print(f"创建了 {len(opportunities_data)} 个商机")
        
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
        print(f"创建了 {len(budget_logs_data)} 条预算日志")
        
        print("\n示例数据初始化完成！")
        
    except Exception as e:
        db.rollback()
        print(f"错误: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # 初始化数据库
    init_db()
    # 创建示例数据
    create_sample_data()
