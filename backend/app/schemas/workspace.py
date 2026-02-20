from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database.enum import WorkspaceRole


class WorkspaceBase(BaseModel):
    name: str
    organization_id: int


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceResponse(WorkspaceBase):
    id: int
    credits: int = 0
    created_at: Optional[datetime] = None
    created_by_id: Optional[int] = None

    class Config:
        from_attributes = True


class WorkspaceMemberBase(BaseModel):
    user_id: int
    workspace_id: int
    role: WorkspaceRole = WorkspaceRole.VIEWER


class WorkspaceMemberCreate(WorkspaceMemberBase):
    pass


class WorkspaceMemberResponse(WorkspaceMemberBase):
    class Config:
        from_attributes = True

