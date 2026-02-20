from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.workspace import Workspace, WorkspaceMember
from app.database.repository.base import BaseRepository

class WorkspaceRepository(BaseRepository[Workspace]):
    def __init__(self, db: AsyncSession):
        super().__init__(Workspace, db)

    async def get_by_organization(self, organization_id: int, skip: int = 0, limit: int = 100) -> list[Workspace]:
        statement = (
            select(Workspace)
            .where(Workspace.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(statement)
        return result.scalars().all()
        
class WorkspaceMemberRepository(BaseRepository[WorkspaceMember]):
    def __init__(self, db: AsyncSession):
        super().__init__(WorkspaceMember, db)

    async def get_member(self, workspace_id: int, user_id: int) -> WorkspaceMember | None:
        """
        Busca um membro específico usando a chave composta (workspace_id, user_id).
        """
        return await self.get((user_id, workspace_id))

    async def get_by_workspace(self, workspace_id: int, skip: int = 0, limit: int = 100) -> list[WorkspaceMember]:
        """
        Lista todos os membros de um workspace específico.
        """
        statement = (
            select(WorkspaceMember)
            .where(WorkspaceMember.workspace_id == workspace_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(statement)
        return result.scalars().all()

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[WorkspaceMember]:
        """
        Lista todos os workspaces que um usuário faz parte.
        """
        statement = (
            select(WorkspaceMember)
            .where(WorkspaceMember.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(statement)
        return result.scalars().all()