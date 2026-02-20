from typing import Any, Generic, Type, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.db import Base

# Define um tipo genérico para os modelos SQLAlchemy
ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """
    Classe base genérica para operações CRUD.

    Esta classe abstrai as interações comuns com o banco de dados
    usando uma sessão SQLAlchemy.
    """

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        """
        Inicializa o repositório com um modelo SQLAlchemy específico e uma sessão de banco de dados.

        :param model: A classe do modelo SQLAlchemy.
        :param db: A sessão do SQLAlchemy para interagir com o banco de dados.
        """
        self.model = model
        self.db = db

    async def get(self, pk: Any) -> ModelType | None:
        """
        Busca um único registro pela sua chave primária.

        :param pk: O valor da chave primária.
        :return: A instância do modelo ou None se não for encontrado.
        """
        return await self.db.get(self.model, pk)

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        """
        :param skip: O número de registros a pular.
        :param limit: O número máximo de registros a retornar.
        :return: Uma lista de instâncias do modelo.
        """
        statement = select(self.model).offset(skip).limit(limit)
        result = await self.db.execute(statement)
        return result.scalars().all()

    async def create(self, obj: ModelType) -> ModelType:
        """
        Adiciona um novo objeto à sessão do banco de dados.

        Nota: A transação não é "commitada" aqui. Isso deve ser feito
        fora do repositório, na camada de serviço ou no endpoint.

        :param obj: A instância do modelo a ser criada.
        :return: A instância do modelo criada, com os dados do banco (ex: ID).
        """
        self.db.add(obj)
        await self.db.flush()  # Garante que o objeto seja enviado ao BD e receba um ID
        await self.db.refresh(obj) # Atualiza o objeto com os dados do BD
        return obj

    async def update(self, pk: Any, data: dict[str, Any]) -> ModelType | None:
        """
        Atualiza um registro existente no banco de dados.

        :param pk: A chave primária do objeto a ser atualizado.
        :param data: Um dicionário com os campos a serem atualizados.
        :return: A instância do modelo atualizada ou None se não for encontrado.
        """
        obj = await self.get(pk)
        if obj:
            for key, value in data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)
            await self.db.flush()
            await self.db.refresh(obj)
        return obj

    async def delete(self, pk: Any) -> ModelType | None:
        """
        Remove um registro do banco de dados.

        :param pk: A chave primária do objeto a ser removido.
        :return: A instância do modelo que foi deletada ou None se não for encontrado.
        """
        obj = await self.get(pk)
        if obj:
            self.db.delete(obj)
            await self.db.flush()
        return obj