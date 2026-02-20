from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.database.enum import KanbanStatus


class KanbanColumnBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    position: int
    is_required: bool = False


class KanbanColumnCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    position: int
    is_required: Optional[bool] = None


class KanbanColumnUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    position: Optional[int] = None


class KanbanColumnResponse(KanbanColumnBase):
    id: int
    board_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class KanbanBoardBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: KanbanStatus = KanbanStatus.ACTIVE
    columns_count: int = 0
    cards_count: int = 0


class KanbanBoardCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: Optional[KanbanStatus] = None
    columns_count: Optional[int] = None
    cards_count: Optional[int] = None
    columns: Optional[list[KanbanColumnCreate]] = None


class KanbanBoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[KanbanStatus] = None
    columns_count: Optional[int] = None
    cards_count: Optional[int] = None


class KanbanBoardResponse(KanbanBoardBase):
    id: int
    workspace_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by_id: Optional[int] = None
    updated_by_id: Optional[int] = None

    class Config:
        from_attributes = True
