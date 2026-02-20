import os
from logging.config import fileConfig

from dotenv import load_dotenv
from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# --- Início da Seção de Configuração ---

# este é o objeto de Configuração do Alembic, que dá acesso
# aos valores dentro do arquivo .ini.
config = context.config

# Carrega o arquivo .env para obter a URL do banco
# O caminho aponta para a pasta raiz do projeto (um nível acima de 'migrations')
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# Pega a URL do banco a partir da variável de ambiente e injeta na configuração
# Esta é a ÚNICA maneira que vamos configurar a URL.
db_url_async = os.getenv('POSTGRES_URL')
if db_url_async:
    # Alembic precisa de um driver síncrono. Removemos o "+asyncpg".
    db_url_sync = db_url_async.replace("+asyncpg", "")
    config.set_main_option('sqlalchemy.url', db_url_sync)
else:
    raise ValueError("A variável de ambiente POSTGRES_URL não foi encontrada no arquivo .env")

# Interpreta o arquivo de configuração para o logging do Python.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- IMPORTANTE: Seção de Importação dos Modelos ---
# Substituímos 'from app.models import *' por importações explícitas.
# Isso garante que o Alembic veja seus modelos.
from app.database.db import Base
from app.database.models import *

# Defina o target_metadata com os metadados da sua Base
target_metadata = Base.metadata

# --- Fim da Seção de Configuração ---

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()