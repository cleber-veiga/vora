from __future__ import annotations

from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database.db import get_db
from app.api.deps import get_current_active_user
from app.database.repository.workspace import WorkspaceRepository
from app.database.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse
from app.database.models.user import User



router = APIRouter(
    prefix="/workspace",
    tags=["Workspace"],
)

@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace_in: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = WorkspaceRepository(db)
    workspace = Workspace(
        name=workspace_in.name,
        organization_id=workspace_in.organization_id,
        created_by_id=current_user.id,
    )
    created = await repo.create(workspace)
    await db.commit()
    return created

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = WorkspaceRepository(db)
    workspace = await repo.get(workspace_id)
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace não encontrado")
    return workspace

@router.get("/", response_model=List[WorkspaceResponse])
async def list_workspaces(
    skip: int = 0,
    limit: int = 100,
    organization_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = WorkspaceRepository(db)
    if organization_id is not None:
        workspaces = await repo.get_by_organization(organization_id=organization_id, skip=skip, limit=limit)
    else:
        workspaces = await repo.get_all(skip=skip, limit=limit)
    return workspaces

@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: int,
    workspace_in: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = WorkspaceRepository(db)
    data = workspace_in.model_dump(exclude_unset=True)
    workspace = await repo.update(workspace_id, data)
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace não encontrado")
    await db.commit()
    return workspace

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = WorkspaceRepository(db)
    workspace = await repo.delete(workspace_id)
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace não encontrado")
    await db.commit()
    return None
