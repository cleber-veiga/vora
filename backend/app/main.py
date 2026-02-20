from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text
from settings import settings
from app.database.db import engine
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.logging import setup_logging, get_logger, logging_context_middleware

setup_logging()
logger = get_logger(__name__)
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando aplicação...")

    # 1) Banco
    try:
        async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
        logger.info("Conexão com banco de dados estabelecida com sucesso")
    except Exception as e:
        logger.error(f"Erro crítico durante inicialização: {e}")
        if settings.ENVIRONMENT == "production":
            raise e

    yield
    
    logger.info("Finalizando aplicação...")
    await engine.dispose()
    logger.info("Recursos liberados com sucesso")

def setup_middlewares(app: FastAPI) -> None:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    cors_origins = getattr(settings, "ALLOWED_ORIGINS", None) or [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if hasattr(settings, 'ALLOWED_HOSTS') and settings.ALLOWED_HOSTS:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

def setup_routers(app: FastAPI) -> None:
    """
    Configura todos os roteadores da aplicação.
    A ORDEM É IMPORTANTE: rotas mais específicas primeiro e agrupados por prefixo.
    """
    api_prefix = "/api"
    
    from app.api.auth.routes import router as auth_router
    from app.api.users.routes import router as users_router
    from app.api.workspace.routes import router as workspace_router
    from app.api.organization.routes import router as organization_router
    from app.api.skill.routes import router as skill_router
    from app.api.kanban.routes import router as kanban_router
    
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(users_router, prefix=api_prefix)
    app.include_router(workspace_router, prefix=api_prefix)
    app.include_router(organization_router, prefix=api_prefix)
    app.include_router(skill_router, prefix=api_prefix)
    app.include_router(kanban_router, prefix=api_prefix)

    logger.info(f"Todos os roteadores da API {api_prefix} configurados")

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        lifespan=lifespan
    )
    app.middleware("http")(logging_context_middleware)
    
    setup_middlewares(app)
    setup_routers(app)

    return app

app = create_application()
