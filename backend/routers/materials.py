"""
物料管理 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Material, WarehousingLog, WithdrawalLog
from schemas import (
    MaterialCreate, 
    MaterialUpdate, 
    MaterialResponse,
    WarehousingLogCreate,
    WarehousingLogResponse,
    WithdrawalLogCreate,
    WithdrawalLogResponse
)

router = APIRouter(prefix="/materials", tags=["物料管理"])

INITIAL_CATEGORIES = [
    '产品宣传册', '易拉宝', '会议定制', 
    '礼品', '办公用品', '其他'
]


def get_material_status(stock: int) -> str:
    """获取物料状态"""
    if stock == 0:
        return "Out of Stock"
    elif stock < 10:
        return "Low Stock"
    return "In Stock"


@router.get("/", response_model=dict)
def get_materials(
    search: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """获取物料列表"""
    query = db.query(Material)
    
    if search:
        query = query.filter(Material.name.contains(search))
    if category:
        query = query.filter(Material.category == category)
    
    total = query.count()
    materials = query.order_by(Material.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    # 获取所有分类
    categories = db.query(Material.category).distinct().all()
    category_list = list(set([c[0] for c in categories] + INITIAL_CATEGORIES))
    
    return {
        "materials": materials,
        "total": total,
        "categories": category_list,
        "page": page,
        "page_size": page_size
    }


@router.post("/", response_model=MaterialResponse)
def create_material(material_data: MaterialCreate, db: Session = Depends(get_db)):
    """创建物料"""
    status = get_material_status(material_data.stock)
    
    db_material = Material(
        **material_data.model_dump(),
        status=status,
        usage_count=0
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    
    return db_material


@router.put("/{material_id}", response_model=MaterialResponse)
def update_material(
    material_id: int,
    material_update: MaterialUpdate,
    db: Session = Depends(get_db)
):
    """更新物料"""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="物料不存在")
    
    update_data = material_update.model_dump(exclude_unset=True)
    
    if 'stock' in update_data:
        update_data['status'] = get_material_status(update_data['stock'])
    
    for key, value in update_data.items():
        setattr(material, key, value)
    
    material.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(material)
    
    return material


@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    """删除物料"""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="物料不存在")
    
    db.delete(material)
    db.commit()
    
    return {"message": "删除成功"}


@router.post("/{material_id}/warehousing", response_model=WarehousingLogResponse)
def add_stock(
    material_id: int,
    log_data: WarehousingLogCreate,
    db: Session = Depends(get_db)
):
    """物料入库"""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="物料不存在")
    
    # 更新库存
    new_stock = material.stock + log_data.count
    material.stock = new_stock
    material.status = get_material_status(new_stock)
    material.updated_at = datetime.utcnow()
    
    # 创建入库记录
    db_log = WarehousingLog(
        material_id=material_id,
        material_name=material.name,
        count=log_data.count,
        operator=log_data.operator,
        is_new_type=log_data.is_new_type,
        date=datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return db_log


@router.post("/{material_id}/withdrawal", response_model=WithdrawalLogResponse)
def withdraw_material(
    material_id: int,
    log_data: WithdrawalLogCreate,
    db: Session = Depends(get_db)
):
    """物料领用"""
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="物料不存在")
    
    if log_data.count > material.stock:
        raise HTTPException(status_code=400, detail="库存不足")
    
    # 更新库存
    new_stock = material.stock - log_data.count
    material.stock = new_stock
    material.usage_count += log_data.count
    material.status = get_material_status(new_stock)
    material.updated_at = datetime.utcnow()
    
    # 创建领用记录
    db_log = WithdrawalLog(
        material_id=material_id,
        material_name=material.name,
        count=log_data.count,
        unit=material.unit,
        user=log_data.user,
        reason=log_data.reason,
        date=datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return db_log


@router.get("/warehousing-logs", response_model=List[WarehousingLogResponse])
def get_warehousing_logs(
    material_name: Optional[str] = None,
    operator: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取入库记录"""
    query = db.query(WarehousingLog)
    
    if material_name:
        query = query.filter(WarehousingLog.material_name.contains(material_name))
    if operator:
        query = query.filter(WarehousingLog.operator.contains(operator))
    
    return query.order_by(WarehousingLog.date.desc()).all()


@router.get("/withdrawal-logs", response_model=List[WithdrawalLogResponse])
def get_withdrawal_logs(
    material_name: Optional[str] = None,
    user: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取领用记录"""
    query = db.query(WithdrawalLog)
    
    if material_name:
        query = query.filter(WithdrawalLog.material_name.contains(material_name))
    if user:
        query = query.filter(WithdrawalLog.user.contains(user))
    
    return query.order_by(WithdrawalLog.date.desc()).all()


@router.get("/grouped")
def get_grouped_materials(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取分组物料"""
    query = db.query(Material)
    
    if search:
        query = query.filter(Material.name.contains(search))
    if category and category != '所有分类':
        query = query.filter(Material.category == category)
    
    materials = query.all()
    
    # 按分类分组
    groups = {}
    for material in materials:
        if material.category not in groups:
            groups[material.category] = []
        groups[material.category].append(material)
    
    return groups
