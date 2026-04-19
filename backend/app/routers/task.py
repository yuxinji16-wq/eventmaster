"""
任务 API 路由
"""
from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskBatchCreate
from app.services.task import TaskService

router = APIRouter(prefix="/tasks", tags=["任务"])
service = TaskService()


@router.get("/activity/{activity_id}", response_model=List[TaskResponse])
def get_tasks_by_activity(
    activity_id: int,
    status: str = None,
    priority: str = None,
    db: Session = Depends(get_db)
):
    """获取活动的所有任务"""
    if status:
        return service.get_by_status(db, activity_id, status)
    if priority:
        return service.get_by_priority(db, activity_id, priority)
    return service.get_by_activity(db, activity_id)


@router.post("/", response_model=TaskResponse)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    """创建任务"""
    return service.create_task(db, data.model_dump())


@router.post("/batch", response_model=List[TaskResponse])
def batch_create_tasks(data: TaskBatchCreate, db: Session = Depends(get_db)):
    """批量创建任务"""
    tasks_data = [task.model_dump() for task in data.tasks]
    return service.batch_create(db, tasks_data)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """获取任务详情"""
    task = service.get(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"任务 {task_id} 不存在")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    """更新任务"""
    task = service.update_task(db, task_id, data.model_dump(exclude_unset=True))
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"任务 {task_id} 不存在")
    return task


@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
    """更新任务状态"""
    task = service.update_status(db, task_id, status)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"任务 {task_id} 不存在")
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """删除任务"""
    if not service.delete_task(db, task_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"任务 {task_id} 不存在")
    return {"message": "删除成功", "code": "E0000"}


@router.delete("/activity/{activity_id}")
def delete_tasks_by_activity(activity_id: int, db: Session = Depends(get_db)):
    """删除活动的所有任务"""
    count = service.delete_by_activity(db, activity_id)
    return {"message": f"已删除 {count} 个任务", "code": "E0000"}
