"""
Service 基类
"""
from typing import TypeVar, Generic, Type, Optional, List, Any
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository

ModelType = TypeVar("ModelType")
RepositoryType = TypeVar("RepositoryType", bound=BaseRepository)


class BaseService(Generic[ModelType, RepositoryType]):
    """Service基类，封装业务逻辑"""

    def __init__(self, repository: RepositoryType):
        self.repository = repository

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        return self.repository.get(db, id)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.repository.get_all(db, skip, limit)

    def create(self, db: Session, obj_in: dict) -> ModelType:
        return self.repository.create(db, obj_in)

    def update(self, db: Session, id: int, obj_in: dict) -> Optional[ModelType]:
        return self.repository.update(db, id, obj_in)

    def delete(self, db: Session, id: int) -> bool:
        return self.repository.delete(db, id)

    def count(self, db: Session) -> int:
        return self.repository.count(db)
