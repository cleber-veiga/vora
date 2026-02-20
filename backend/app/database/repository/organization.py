from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.organization import Organization, OrganizationMember
from app.database.repository.base import BaseRepository

class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self, db: AsyncSession):
        super().__init__(Organization, db)

class OrganizationMemberRepository(BaseRepository[OrganizationMember]):
    def __init__(self, db: AsyncSession):
        super().__init__(OrganizationMember, db)

    async def get_member(self, organization_id: int, user_id: int) -> OrganizationMember | None:
        """
        Busca um membro específico usando a chave composta (organization_id, user_id).
        Utiliza o método get() do BaseRepository passando a tupla da PK.
        """
        return await self.get((user_id, organization_id))

    async def get_by_organization(self, organization_id: int, skip: int = 0, limit: int = 100) -> list[OrganizationMember]:
        """
        Lista todos os membros de uma organização específica.
        """
        statement = (
            select(OrganizationMember)
            .options(joinedload(OrganizationMember.user))
            .where(OrganizationMember.organization_id == organization_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(statement)
        return result.scalars().all()

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[OrganizationMember]:
        """
        Lista todas as organizações que um usuário faz parte.
        """
        statement = (
            select(OrganizationMember)
            .where(OrganizationMember.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(statement)
        return result.scalars().all()