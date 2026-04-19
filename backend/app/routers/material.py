"""
物料 API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.material import (
    MaterialCreate, MaterialUpdate, MaterialResponse,
    WarehousingLogCreate, WarehousingLogResponse,
    WithdrawalLogCreate, WithdrawalLogResponse
)
from app.services.material import MaterialService, WarehousingLogService, WithdrawalLogService
from app.core.errors import MaterialException

router = APIRouter(prefix="/materials", tags=["物料"])
material_service = MaterialService()
warehousing_service = WarehousingLogService()
withdrawal_service = WithdrawalLogService()


@router.get("/", response_model=List[MaterialResponse])
def list_materials(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    low_stock: bool = False,
    db: Session = Depends(get_db)
):
    """获取物料列表"""
    if low_stock:
        return material_service.get_low_stock(db, skip, limit)
    if category:
        return material_service.get_by_category(db, category, skip, limit)
    if keyword:
        return material_service.search(db, keyword, skip, limit)
    return material_service.get_all(db, skip, limit)


@router.get("/warehousing-logs", response_model=List[WarehousingLogResponse])
def list_all_warehousing_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取全部入库记录"""
    return warehousing_service.get_all(db, skip, limit)


@router.get("/withdrawal-logs", response_model=List[WithdrawalLogResponse])
def list_all_withdrawal_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    activity_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """获取全部出库记录，可按活动过滤"""
    if activity_id:
        return withdrawal_service.get_by_activity(db, activity_id, skip, limit)
    return withdrawal_service.get_all(db, skip, limit)


@router.get("/{material_id}", response_model=MaterialResponse)
def get_material(material_id: int, db: Session = Depends(get_db)):
    """获取物料详情"""
    material = material_service.get(db, material_id)
    if not material:
        raise MaterialException.not_found(material_id)
    return material


@router.post("/", response_model=MaterialResponse)
def create_material(data: MaterialCreate, db: Session = Depends(get_db)):
    """创建物料"""
    try:
        return material_service.create(db, data.model_dump())
    except Exception as e:
        raise MaterialException.creation_failed(reason=str(e))


@router.put("/{material_id}", response_model=MaterialResponse)
def update_material(material_id: int, data: MaterialUpdate, db: Session = Depends(get_db)):
    """更新物料"""
    material = material_service.update(db, material_id, data.model_dump(exclude_unset=True))
    if not material:
        raise MaterialException.not_found(material_id)
    return material


@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    """删除物料"""
    if not material_service.delete(db, material_id):
        raise MaterialException.not_found(material_id)
    return {"message": "删除成功", "code": "E0000"}


# 入库记录
@router.get("/{material_id}/warehousing", response_model=List[WarehousingLogResponse])
def list_warehousing_logs(
    material_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取物料入库记录"""
    return warehousing_service.get_by_material(db, material_id, skip, limit)


class WarehousingRequest(BaseModel):
    """入库请求"""
    count: int
    operator: str
    is_new_type: bool = False


class WithdrawalRequest(BaseModel):
    """出库请求"""
    count: int
    user: str
    reason: str = ""
    activity_id: Optional[int] = None


@router.post("/{material_id}/warehousing", response_model=WarehousingLogResponse)
def create_warehousing_for_material(
    material_id: int,
    data: WarehousingRequest,
    db: Session = Depends(get_db)
):
    """为指定物料创建入库记录"""
    from datetime import datetime
    log_data = {
        "material_id": material_id,
        "count": data.count,
        "operator": data.operator,
        "is_new_type": "true" if data.is_new_type else "false",
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    return warehousing_service.create_warehousing(db, log_data)


@router.post("/warehousing", response_model=WarehousingLogResponse)
def create_warehousing(data: WarehousingLogCreate, db: Session = Depends(get_db)):
    """创建入库记录"""
    return warehousing_service.create_warehousing(db, data.model_dump())


# 出库记录
@router.get("/{material_id}/withdrawal", response_model=List[WithdrawalLogResponse])
def list_withdrawal_logs(
    material_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取物料出库记录"""
    return withdrawal_service.get_by_material(db, material_id, skip, limit)


@router.post("/{material_id}/withdrawal", response_model=WithdrawalLogResponse)
def create_withdrawal_for_material(
    material_id: int,
    data: WithdrawalRequest,
    db: Session = Depends(get_db)
):
    """为指定物料创建出库记录"""
    from datetime import datetime
    log_data = {
        "material_id": material_id,
        "count": data.count,
        "user": data.user,
        "reason": data.reason,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "activity_id": data.activity_id,
        "status": "领用中",
    }
    return withdrawal_service.create_withdrawal(db, log_data)


@router.post("/withdrawal", response_model=WithdrawalLogResponse)
def create_withdrawal(data: WithdrawalLogCreate, db: Session = Depends(get_db)):
    """创建出库记录"""
    return withdrawal_service.create_withdrawal(db, data.model_dump())


@router.patch("/withdrawal/{log_id}/return", response_model=WithdrawalLogResponse)
def return_withdrawal(log_id: int, return_count: Optional[float] = None, db: Session = Depends(get_db)):
    """标记领用记录归还"""
    log = withdrawal_service.mark_returned(db, log_id, return_count)
    if not log:
        raise MaterialException.not_found(log_id)
    return log
