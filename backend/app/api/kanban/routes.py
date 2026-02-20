from __future__ import annotations

from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database.db import get_db
from app.api.deps import get_current_active_user
from app.database.models.user import User
from app.database.models.workspace import Workspace
from app.database.models.kanban_board import KanbanBoard
from app.database.models.kanban_column import KanbanColumn
from app.database.repository.workspace import WorkspaceRepository
from app.database.repository.kanban_board import KanbanBoardRepository
from app.database.repository.kanban_column import KanbanColumnRepository
from app.schemas.kanban import (
    KanbanBoardCreate,
    KanbanBoardUpdate,
    KanbanBoardResponse,
    KanbanColumnCreate,
    KanbanColumnUpdate,
    KanbanColumnResponse,
)
from app.database.enum import KanbanStatus


router = APIRouter(
    prefix="/workspace/{workspace_id}/kanban",
    tags=["Kanban"],
)


async def _get_workspace_or_404(workspace_id: int, db: AsyncSession) -> Workspace:
    repo = WorkspaceRepository(db)
    workspace = await repo.get(workspace_id)
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace não encontrado")
    return workspace


async def _get_board_or_404(workspace_id: int, board_id: int, db: AsyncSession) -> KanbanBoard:
    repo = KanbanBoardRepository(db)
    board = await repo.get_in_workspace(workspace_id=workspace_id, board_id=board_id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quadro não encontrado")
    return board


@router.post("/", response_model=KanbanBoardResponse, status_code=status.HTTP_201_CREATED)
async def create_kanban_board(
    workspace_id: int,
    kanban_in: KanbanBoardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    board = KanbanBoard(
        workspace_id=workspace_id,
        name=kanban_in.name,
        description=kanban_in.description,
        status=kanban_in.status or KanbanStatus.ACTIVE,
        columns_count=0,
        cards_count=kanban_in.cards_count or 0,
        created_by_id=current_user.id,
        updated_by_id=current_user.id,
    )
    db.add(board)
    await db.commit()
    await db.refresh(board)
    if kanban_in.columns:
        columns = []
        for column_in in kanban_in.columns:
            columns.append(
                KanbanColumn(
                    board_id=board.id,
                    name=column_in.name,
                    description=column_in.description,
                    color=column_in.color,
                    position=column_in.position,
                    is_required=bool(column_in.is_required),
                )
            )
        db.add_all(columns)
        board.columns_count = len(columns)
        await db.commit()
        await db.refresh(board)
    elif kanban_in.columns_count is not None:
        board.columns_count = kanban_in.columns_count
        await db.commit()
        await db.refresh(board)
    return board


@router.get("/", response_model=List[KanbanBoardResponse])
async def list_kanban_boards(
    workspace_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    repo = KanbanBoardRepository(db)
    return await repo.get_by_workspace(workspace_id=workspace_id, skip=skip, limit=limit)


@router.get("/{board_id}", response_model=KanbanBoardResponse)
async def get_kanban_board(
    workspace_id: int,
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    board = await _get_board_or_404(workspace_id, board_id, db)
    return board


@router.put("/{board_id}", response_model=KanbanBoardResponse)
async def update_kanban_board(
    workspace_id: int,
    board_id: int,
    kanban_in: KanbanBoardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    board = await _get_board_or_404(workspace_id, board_id, db)

    data = kanban_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        if hasattr(board, key):
            setattr(board, key, value)
    board.updated_by_id = current_user.id
    await db.commit()
    await db.refresh(board)
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_kanban_board(
    workspace_id: int,
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    board = await _get_board_or_404(workspace_id, board_id, db)
    await db.delete(board)
    await db.commit()
    return None


@router.get("/{board_id}/columns", response_model=List[KanbanColumnResponse])
async def list_columns(
    workspace_id: int,
    board_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    await _get_board_or_404(workspace_id, board_id, db)
    repo = KanbanColumnRepository(db)
    return await repo.get_by_board(board_id=board_id)


@router.post("/{board_id}/columns", response_model=KanbanColumnResponse, status_code=status.HTTP_201_CREATED)
async def create_column(
    workspace_id: int,
    board_id: int,
    column_in: KanbanColumnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    board = await _get_board_or_404(workspace_id, board_id, db)
    column = KanbanColumn(
        board_id=board_id,
        name=column_in.name,
        description=column_in.description,
        color=column_in.color,
        position=column_in.position,
        is_required=bool(column_in.is_required),
    )
    db.add(column)
    board.columns_count = (board.columns_count or 0) + 1
    await db.commit()
    await db.refresh(column)
    return column


@router.put("/{board_id}/columns/{column_id}", response_model=KanbanColumnResponse)
async def update_column(
    workspace_id: int,
    board_id: int,
    column_id: int,
    column_in: KanbanColumnUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    await _get_board_or_404(workspace_id, board_id, db)
    repo = KanbanColumnRepository(db)
    column = await repo.get_in_board(board_id=board_id, column_id=column_id)
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coluna não encontrada")

    data = column_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        if hasattr(column, key):
            setattr(column, key, value)
    await db.commit()
    await db.refresh(column)
    return column


@router.delete("/{board_id}/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    workspace_id: int,
    board_id: int,
    column_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await _get_workspace_or_404(workspace_id, db)
    board = await _get_board_or_404(workspace_id, board_id, db)
    repo = KanbanColumnRepository(db)
    column = await repo.get_in_board(board_id=board_id, column_id=column_id)
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coluna não encontrada")
    await db.delete(column)
    board.columns_count = max((board.columns_count or 1) - 1, 0)
    await db.commit()
    return None
