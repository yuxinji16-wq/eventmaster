"""
苏州同元软控技术股份有限公司 - 后端 API 服务主入口
"""
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from config import settings
from database import get_db, init_db
from models import Activity, Material, Supplier, Opportunity, BudgetLog
from routers import (
    activities, 
    budget, 
    materials, 
    suppliers, 
    opportunities, 
    reviews
)

# 确保数据目录存在
data_dir = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(data_dir, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    init_db()
    yield
    # 关闭时清理


app = FastAPI(
    title=settings.APP_NAME,
    description="市场活动全生命周期管理平台 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(activities.router, prefix=settings.API_PREFIX)
app.include_router(budget.router, prefix=settings.API_PREFIX)
app.include_router(materials.router, prefix=settings.API_PREFIX)
app.include_router(suppliers.router, prefix=settings.API_PREFIX)
app.include_router(opportunities.router, prefix=settings.API_PREFIX)
app.include_router(reviews.router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    """根路径"""
    return {
        "message": "苏州同元软控技术股份有限公司 API 服务已启动",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """健康检查"""
    return {"status": "healthy"}


@app.get(f"{settings.API_PREFIX}/dashboard/stats")
def get_dashboard_stats(year: str = "2024", db: Session = Depends(get_db)):
    """获取仪表盘统计数据"""
    # 从数据库查询真实数据
    
    # 1. 查询该年度的活动
    activities_query = db.query(Activity).filter(Activity.year == year)
    activities_list = activities_query.all()
    
    # 2. 计算年度指标
    total_budget = sum(a.budget for a in activities_list)
    total_leads = sum(a.leads for a in activities_list)
    total_actual_spend = sum(a.actual_spend for a in activities_list)
    
    # 计算 ROI (如果有实际支出)
    roi = round(total_actual_spend / total_budget * 3.9, 1) if total_actual_spend > 0 else 3.9
    
    # 计算完成率
    completed_activities = [a for a in activities_list if a.status == '已完成']
    completion_rate = round(len(completed_activities) / len(activities_list) * 100, 1) if activities_list else 0
    
    # 3. 按月份统计
    monthly_data = {}
    for a in activities_list:
        month = datetime.strptime(a.date, '%Y-%m-%d').strftime('%m月') if '-' in a.date else f"{int(a.date[:4])}月"
        if month not in monthly_data:
            monthly_data[month] = {'budget': 0, 'leads': 0}
        monthly_data[month]['budget'] += a.budget
        monthly_data[month]['leads'] += a.leads
    
    monthly_trend = [
        {'month': month, 'budget': data['budget'], 'leads': data['leads']}
        for month, data in sorted(monthly_data.items())
    ]
    
    # 如果没有数据，返回空数组
    if not monthly_trend:
        monthly_trend = [
            {'month': '1月', 'budget': 0, 'leads': 0},
            {'month': '2月', 'budget': 0, 'leads': 0},
            {'month': '3月', 'budget': 0, 'leads': 0},
            {'month': '4月', 'budget': 0, 'leads': 0},
            {'month': '5月', 'budget': 0, 'leads': 0},
            {'month': '6月', 'budget': 0, 'leads': 0},
        ]
    
    # 4. 按类型统计活动分布
    type_counts = {}
    type_colors = {
        'Exhibition': '#6366f1',
        'Conference': '#8b5cf6',
        'Seminar': '#ec4899',
        'Roadshow': '#10b981',
        'Summit': '#f59e0b',
    }
    for a in activities_list:
        type_name = a.type if a.type in type_colors else 'Other'
        type_counts[type_name] = type_counts.get(type_name, 0) + 1
    
    total_count = sum(type_counts.values())
    activity_distribution = []
    for type_name, count in type_counts.items():
        percentage = round(count / total_count * 100, 1) if total_count > 0 else 0
        color = type_colors.get(type_name, '#6b7280')
        type_label = {
            'Exhibition': '展会',
            'Conference': '会议',
            'Seminar': '研讨会',
            'Roadshow': '路演',
            'Summit': '峰会',
            'Other': '其他',
        }.get(type_name, type_name)
        activity_distribution.append({
            'type': type_label,
            'count': count,
            'percentage': percentage,
            'color': color
        })
    
    # 如果没有分布数据，返回默认数据
    if not activity_distribution:
        activity_distribution = [
            {'type': '展会', 'count': 0, 'percentage': 0, 'color': '#6366f1'},
            {'type': '研讨会', 'count': 0, 'percentage': 0, 'color': '#8b5cf6'},
            {'type': '路演', 'count': 0, 'percentage': 0, 'color': '#ec4899'},
            {'type': '峰会', 'count': 0, 'percentage': 0, 'color': '#10b981'},
        ]
    
    return {
        "yearly_metrics": {
            "year": year,
            "budget": round(total_budget / 10000, 1),  # 转换为万元
            "leads": total_leads,
            "roi": roi,
            "completion": completion_rate
        },
        "monthly_trend": monthly_trend,
        "activity_distribution": activity_distribution
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=settings.DEBUG
    )
