"""
供应商 API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.supplier import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    SupplierReviewCreate, SupplierReviewResponse,
    BillCreate, BillResponse
)
from app.services.supplier import SupplierService, SupplierReviewService, BillService
from app.core.errors import SupplierException, NotFoundException

router = APIRouter(prefix="/suppliers", tags=["供应商"])
supplier_service = SupplierService()
review_service = SupplierReviewService()
bill_service = BillService()


@router.get("/", response_model=List[SupplierResponse])
def list_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取供应商列表"""
    if category:
        return supplier_service.get_by_category(db, category, skip, limit)
    if keyword:
        return supplier_service.search(db, keyword, skip, limit)
    return supplier_service.get_all(db, skip, limit)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """获取供应商详情"""
    supplier = supplier_service.get(db, supplier_id)
    if not supplier:
        raise SupplierException.not_found(supplier_id)
    return supplier


@router.post("/", response_model=SupplierResponse)
def create_supplier(data: SupplierCreate, db: Session = Depends(get_db)):
    """创建供应商"""
    try:
        return supplier_service.create(db, data.model_dump())
    except Exception as e:
        raise SupplierException.creation_failed(reason=str(e))


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(supplier_id: int, data: SupplierUpdate, db: Session = Depends(get_db)):
    """更新供应商"""
    supplier = supplier_service.update(db, supplier_id, data.model_dump(exclude_unset=True))
    if not supplier:
        raise SupplierException.not_found(supplier_id)
    return supplier


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """删除供应商"""
    if not supplier_service.delete(db, supplier_id):
        raise SupplierException.not_found(supplier_id)
    return {"message": "删除成功", "code": "E0000"}


# 供应商评价
@router.get("/{supplier_id}/reviews", response_model=List[SupplierReviewResponse])
def list_supplier_reviews(
    supplier_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取供应商评价列表"""
    return review_service.get_by_supplier(db, supplier_id, skip, limit)


@router.post("/reviews", response_model=SupplierReviewResponse)
def create_supplier_review(data: SupplierReviewCreate, db: Session = Depends(get_db)):
    """创建供应商评价"""
    return review_service.create(db, data.model_dump())


@router.get("/{supplier_id}/avg-score")
def get_supplier_avg_score(supplier_id: int, db: Session = Depends(get_db)):
    """获取供应商平均评分"""
    avg_score = review_service.get_avg_score(db, supplier_id)
    return {"supplier_id": supplier_id, "avg_score": avg_score}


# 账单
@router.get("/{supplier_id}/bills", response_model=List[BillResponse])
def list_supplier_bills(
    supplier_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取供应商账单"""
    return bill_service.get_by_supplier(db, supplier_id, skip, limit)


@router.post("/bills", response_model=BillResponse)
def create_bill(data: BillCreate, db: Session = Depends(get_db)):
    """创建账单"""
    return bill_service.create(db, data.model_dump())


@router.put("/bills/{bill_id}/paid", response_model=BillResponse)
def mark_bill_paid(bill_id: int, db: Session = Depends(get_db)):
    """标记账单已付款"""
    bill = bill_service.mark_paid(db, bill_id)
    if not bill:
        raise NotFoundException("账单", bill_id)
    return bill


@router.get("/bills/pending", response_model=List[BillResponse])
def list_pending_bills(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取待付款账单"""
    return bill_service.get_pending(db, skip, limit)
