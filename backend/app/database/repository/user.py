from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models.user import User
from app.database.repository.base import BaseRepository
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> User | None:
        """
        Busca um usuário pelo email.

        :param email: O email do usuário.
        :return: A instância do usuário ou None se não for encontrado.
        """
        statement = select(User).where(User.email == email)
        result = await self.db.execute(statement)
        return result.scalars().first()

    async def create(self, user_in: UserCreate) -> User:
        """
        Cria um novo usuário.

        :param user_in: Dados do usuário para criação.
        :return: A instância do usuário criado.
        """
        db_obj = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            phone=user_in.phone,
            avatar_url=user_in.avatar_url,
        )
        self.db.add(db_obj)
        await self.db.commit() # Committing here to persist changes, although BaseRepository uses flush.
        await self.db.refresh(db_obj)
        return db_obj