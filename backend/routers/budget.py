"""
预算管理 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Activity, BudgetLog, YearlyQuota
from schemas import (
    BudgetLogCreate, 
    BudgetLogUpdate, 
    BudgetLogResponse,
    BudgetOverviewResponse,
    UpdateQuotaRequest,
    GenerateSummaryResponse
)
from services.ai_service import get_marketing_insight

router = APIRouter(prefix="/budget", tags=["预算管理"])


BUDGET_CATEGORIES = [
    '展会/展览', '品牌推广', '礼品/物料', 
    '差旅/招待', '场地租用', '物流/运费', '其他'
]

COLORS = {
    '展会/展览': '#6366f1',
    '品牌推广': '#10b981',
    '礼品/物料': '#f59e0b',
    '差旅/招待': '#ef4444',
    '场地租用': '#a855f7',
    '物流/运费': '#06b6d4',
    '其他': '#94a3b8'
}


def get_category_color(category: str) -> str:
    """获取类别颜色"""
    return COLORS.get(category, '#94a3b8')


@router.get("/overview", response_model=BudgetOverviewResponse)
def get_budget_overview(year: str, db: Session = Depends(get_db)):
    """获取预算概览"""
    # 年度配额
    quota = db.query(YearlyQuota).filter(YearlyQuota.year == year).first()
    yearly_quota = quota.quota if quota else 0
    
    # 已核销金额
    logs = db.query(BudgetLog).filter(
        BudgetLog.date.startswith(year),
        BudgetLog.type == 'expense'
    ).all()
    total_reimbursed = sum(log.amount for log in logs)
    
    # 超支项目
    activities = db.query(Activity).filter(Activity.year == year).all()
    risk_projects = sum(1 for a in activities if a.actual_spend > a.budget)
    
    # 类别统计
    stats = {cat: 0 for cat in BUDGET_CATEGORIES}
    for log in logs:
        if log.category in stats:
            stats[log.category] += log.amount
    
    total = sum(stats.values()) or 1
    category_stats = [
        {
            "name": cat,
            "amount": amount,
            "percentage": round((amount / total) * 100),
            "color": get_category_color(cat)
        }
        for cat, amount in stats.items()
    ]
    category_stats.sort(key=lambda x: x['amount'], reverse=True)
    
    return {
        "yearly_quota": yearly_quota,
        "total_reimbursed": total_reimbursed,
        "risk_projects": risk_projects,
        "execution_rate": round((total_reimbursed / yearly_quota) * 100, 1) if yearly_quota else 0,
        "category_stats": category_stats
    }


@router.put("/quota")
def update_quota(quota_data: UpdateQuotaRequest, db: Session = Depends(get_db)):
    """更新年度预算配额"""
    quota = db.query(YearlyQuota).filter(
        YearlyQuota.year == quota_data.year
    ).first()
    
    if quota:
        quota.quota = quota_data.quota
        quota.updated_at = datetime.utcnow()
    else:
        quota = YearlyQuota(
            year=quota_data.year,
            quota=quota_data.quota
        )
        db.add(quota)
    
    db.commit()
    
    return {"message": "配额更新成功"}


@router.get("/activities")
def get_activity_budgets(
    year: str,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取活动预算列表"""
    query = db.query(Activity).filter(Activity.year == year)
    
    if search:
        query = query.filter(Activity.name.contains(search))
    
    activities = query.all()
    
    result = []
    for a in activities:
        execution_rate = (a.actual_spend / a.budget * 100) if a.budget > 0 else 0
        result.append({
            "id": a.id,
            "name": a.name,
            "date": a.date,
            "budget": a.budget,
            "actual_spend": a.actual_spend,
            "execution_rate": round(execution_rate, 1)
        })
    
    return {
        "activities": result,
        "total": len(result)
    }


@router.get("/logs", response_model=List[BudgetLogResponse])
def get_budget_logs(
    activity_id: int,
    db: Session = Depends(get_db)
):
    """获取预算日志列表"""
    logs = db.query(BudgetLog).filter(
        BudgetLog.activity_id == activity_id
    ).order_by(BudgetLog.date.desc()).all()
    
    return logs


@router.post("/logs", response_model=BudgetLogResponse)
def create_budget_log(
    log_data: BudgetLogCreate,
    db: Session = Depends(get_db)
):
    """创建预算日志"""
    db_log = BudgetLog(**log_data.model_dump())
    db.add(db_log)
    
    # 更新活动实际支出
    activity = db.query(Activity).filter(
        Activity.id == log_data.activity_id
    ).first()
    if activity:
        activity.actual_spend += log_data.amount
        activity.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_log)
    
    return db_log


@router.put("/logs/{log_id}", response_model=BudgetLogResponse)
def update_budget_log(
    log_id: int,
    log_update: BudgetLogUpdate,
    db: Session = Depends(get_db)
):
    """更新预算日志"""
    log = db.query(BudgetLog).filter(BudgetLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="预算日志不存在")
    
    for key, value in log_update.model_dump(exclude_unset=True).items():
        setattr(log, key, value)
    
    db.commit()
    db.refresh(log)
    
    return log


@router.delete("/logs/{log_id}")
def delete_budget_log(log_id: int, db: Session = Depends(get_db)):
    """删除预算日志"""
    log = db.query(BudgetLog).filter(BudgetLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="预算日志不存在")
    
    # 更新活动实际支出
    activity = db.query(Activity).filter(
        Activity.id == log.activity_id
    ).first()
    if activity:
        activity.actual_spend -= log.amount
    
    db.delete(log)
    db.commit()
    
    return {"message": "删除成功"}


@router.post("/analyze")
def analyze_budget(
    activity_id: int,
    db: Session = Depends(get_db)
):
    """AI分析预算"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    logs = db.query(BudgetLog).filter(
        BudgetLog.activity_id == activity_id
    ).all()
    
    prompt = f"""
    请深度分析活动 "{activity.name}" 的财务状况。
    预算 ¥{activity.budget}，已支出 ¥{activity.actual_spend}。
    明细：{[{
        'name': log.name,
        'amount': log.amount,
        'category': log.category,
        'status': log.status
    } for log in logs]}
    
    给出风险和优化建议。
    """
    
    insight = get_marketing_insight(prompt)
    
    risk_level = "high" if activity.actual_spend > activity.budget else \
                  "medium" if activity.actual_spend > activity.budget * 0.8 else "low"
    
    return {
        "insight": insight,
        "risk_level": risk_level,
        "recommendations": ["建议进行供应商议价复核", "建议优化预算分配"] if risk_level != "low" else ["预算执行良好"]
    }
