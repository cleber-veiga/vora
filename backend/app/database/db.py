# app/database/db.py
"""
Configuração do banco de dados com SQLAlchemy async.
Refatorado para desabilitar echo SQL em produção.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from settings import settings
from typing import AsyncGenerator

# Determina se deve fazer echo baseado no ambiente
# Em produção, echo deve ser False para evitar logs excessivos
ECHO_SQL = settings.is_production and settings.SQL_ECHO

# Cria engine e sessão assíncronas
engine = create_async_engine(
    settings.POSTGRES_URL,
    echo=ECHO_SQL,
    future=True,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
    connect_args={
        "statement_cache_size": 0,
    },
)
"""
Engine assíncrona do SQLAlchemy para conexão com PostgreSQL.

Configurações:
    - echo: Habilitado apenas em desenvolvimento (baseado em settings.SQL_ECHO)
    - future=True: Usa a API 2.0 do SQLAlchemy 
    - pool_size=10: Tamanho do pool de conexões
    - max_overflow=20: Conexões extras além do pool_size
    - pool_timeout=30: Timeout para obter conexão do pool
    - pool_recycle=1800: Recicla conexões após 30 minutos
    - pool_pre_ping=True: Testa conexões antes de usar (previne conexões inválidas)
    - statement_cache_size=0: Desabilita cache de statements (evita problemas com prepared statements)
"""

async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
"""
Factory para criação de sessões assíncronas do SQLAlchemy.

Configurações:
    - bind=engine: Vincula ao engine assíncrono configurado
    - class_=AsyncSession: Define o tipo de sessão como assíncrona
    - expire_on_commit=False: Mantém objetos válidos após commit (evita lazy loading issues)
"""

Base = declarative_base()
"""
Classe base para todos os modelos ORM do SQLAlchemy.

Todos os modelos da aplicação devem herdar desta classe base para ter
as funcionalidades do ORM disponíveis (mapeamento objeto-relacional).
"""


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency provider para obter sessões de banco de dados.
    
    Esta função é usada como dependency no FastAPI para injetar sessões
    de banco de dados nos endpoints da API. Garante que a sessão seja
    automaticamente fechada após o uso.
    
    Yields:
        AsyncSession: Sessão assíncrona do SQLAlchemy configurada e pronta para uso.
        
    Note:
        - A sessão é criada no início da requisição
        - A sessão é automaticamente fechada ao final da requisição
        - Utiliza context manager (async with) para garantir cleanup adequado
        - Ideal para uso com Depends() no FastAPI
        
    Example:
        ```python
        @app.get("/users/")
        async def get_users(db: AsyncSession = Depends(get_db)):
            # usar db aqui
            pass
        ```
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Inicializa o banco de dados criando todas as tabelas.
    
    Esta função deve ser chamada na inicialização da aplicação.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """
    Fecha todas as conexões do pool de banco de dados.
    
    Esta função deve ser chamada no shutdown da aplicação.
    """
    await engine.dispose()

