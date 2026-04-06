"""
数据库初始化
"""
import os
from app.db.base import Base
from app.db.session import engine


def init_db():
    """初始化数据库，创建所有表"""
    # 确保数据目录存在
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    os.makedirs(data_dir, exist_ok=True)

    # 导入所有模型以确保它们被注册
    from app.models import activity, material, supplier, budget, opportunity, review

    # 创建所有表
    Base.metadata.create_all(bind=engine)


def drop_db():
    """删除所有表（谨慎使用）"""
    Base.metadata.drop_all(bind=engine)
