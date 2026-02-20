from sqlalchemy import select, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models.kanban_column import KanbanColumn
from app.database.repository.base import BaseRepository


class KanbanColumnRepository(BaseRepository[KanbanColumn]):
    def __init__(self, db: AsyncSession):
        super().__init__(KanbanColumn, db)

    async def get_by_board(self, board_id: int) -> list[KanbanColumn]:
        statement = (
            select(KanbanColumn)
            .where(KanbanColumn.board_id == board_id)
            .order_by(asc(KanbanColumn.position))
        )
        result = await self.db.execute(statement)
        return result.scalars().all()

    async def get_in_board(self, board_id: int, column_id: int) -> KanbanColumn | None:
        statement = select(KanbanColumn).where(
            KanbanColumn.id == column_id,
            KanbanColumn.board_id == board_id,
        )
        result = await self.db.execute(statement)
        return result.scalar_one_or_none()
