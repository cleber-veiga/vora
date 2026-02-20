from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.kanban_board import KanbanBoard
from app.database.repository.base import BaseRepository


class KanbanBoardRepository(BaseRepository[KanbanBoard]):
    def __init__(self, db: AsyncSession):
        super().__init__(KanbanBoard, db)

    async def get_by_workspace(self, workspace_id: int, skip: int = 0, limit: int = 100) -> list[KanbanBoard]:
        statement = (
            select(KanbanBoard)
            .where(KanbanBoard.workspace_id == workspace_id)
            .order_by(desc(KanbanBoard.updated_at))
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(statement)
        return result.scalars().all()

    async def get_in_workspace(self, workspace_id: int, board_id: int) -> KanbanBoard | None:
        statement = select(KanbanBoard).where(
            KanbanBoard.id == board_id,
            KanbanBoard.workspace_id == workspace_id,
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()
