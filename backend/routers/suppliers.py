"""
供应商管理 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Supplier, Review, Bill
from schemas import (
    SupplierCreate, 
    SupplierUpdate, 
    SupplierResponse,
    SupplierDetailResponse,
    ReviewCreate,
    ReviewResponse,
    BillCreate,
    BillResponse
)

router = APIRouter(prefix="/suppliers", tags=["供应商管理"])

CATEGORIES = ['搭建', '设计', '影音', '礼品', '印刷', '其他']


@router.get("/", response_model=dict)
def get_suppliers(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """获取供应商列表"""
    query = db.query(Supplier)
    
    if category and category != '全部':
        query = query.filter(Supplier.service_type == category)
    if search:
        query = query.filter(
            (Supplier.name.contains(search)) |
            (Supplier.contact.contains(search))
        )
    
    total = query.count()
    suppliers = query.order_by(Supplier.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return {
        "suppliers": suppliers,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{supplier_id}", response_model=SupplierDetailResponse)
def get_supplier_detail(supplier_id: int, db: Session = Depends(get_db)):
    """获取供应商详情"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="供应商不存在")
    
    return supplier


@router.post("/", response_model=SupplierResponse)
def create_supplier(supplier_data: SupplierCreate, db: Session = Depends(get_db)):
    """创建供应商"""
    db_supplier = Supplier(
        **supplier_data.model_dump(),
        last_used=datetime.utcnow().date(),
        order_count=0
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    
    return db_supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    supplier_update: SupplierUpdate,
    db: Session = Depends(get_db)
):
    """更新供应商"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="供应商不存在")
    
    update_data = supplier_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(supplier, key, value)
    
    supplier.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(supplier)
    
    return supplier


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """删除供应商"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="供应商不存在")
    
    db.delete(supplier)
    db.commit()
    
    return {"message": "删除成功"}


@router.post("/{supplier_id}/reviews", response_model=ReviewResponse)
def add_review(
    supplier_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db)
):
    """添加评价"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="供应商不存在")
    
    db_review = Review(
        supplier_id=supplier_id,
        **review_data.model_dump()
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return db_review


@router.post("/{supplier_id}/bills", response_model=BillResponse)
def add_bill(
    supplier_id: int,
    bill_data: BillCreate,
    db: Session = Depends(get_db)
):
    """添加账单"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="供应商不存在")
    
    db_bill = Bill(
        supplier_id=supplier_id,
        **bill_data.model_dump()
    )
    db.add(db_bill)
    
    # 更新订单数
    supplier.order_count += 1
    supplier.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_bill)
    
    return db_bill


@router.get("/{supplier_id}/reviews", response_model=List[ReviewResponse])
def get_reviews(supplier_id: int, db: Session = Depends(get_db)):
    """获取评价列表"""
    return db.query(Review).filter(
        Review.supplier_id == supplier_id
    ).order_by(Review.date.desc()).all()


@router.get("/{supplier_id}/bills", response_model=List[BillResponse])
def get_bills(supplier_id: int, db: Session = Depends(get_db)):
    """获取账单列表"""
    return db.query(Bill).filter(
        Bill.supplier_id == supplier_id
    ).order_by(Bill.date.desc()).all()
