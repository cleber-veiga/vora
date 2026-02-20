import logging
import logging.config
import sys
import uuid
import json
import contextvars
from typing import Any, Dict
from settings import settings

request_id_var = contextvars.ContextVar("request_id", default="-")
client_ip_var = contextvars.ContextVar("client_ip", default="-")
path_var = contextvars.ContextVar("path", default="-")
method_var = contextvars.ContextVar("method", default="-")
user_agent_var = contextvars.ContextVar("user_agent", default="-")

class ContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        record.client_ip = client_ip_var.get()
        record.path = path_var.get()
        record.method = method_var.get()
        record.user_agent = user_agent_var.get()
        return True

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "ts": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
            "client_ip": getattr(record, "client_ip", "-"),
            "method": getattr(record, "method", "-"),
            "path": getattr(record, "path", "-"),
            "user_agent": getattr(record, "user_agent", "-"),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)

def setup_logging() -> None:
    """
    Configura logging para toda a aplicação.
    - DEV: texto legível
    - PROD: JSON estruturado
    - Integra com Uvicorn
    """
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    is_prod = settings.ENVIRONMENT == "production"
    handlers = ["console"]

    dict_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "filters": {
            "ctx": {"()": ContextFilter}
        },
        "formatters": {
            "dev": {
                "format": "%(asctime)s | %(levelname)-8s | %(name)s | rid=%(request_id)s | "
                          "%(client_ip)s | %(method)s %(path)s | %(message)s",
                "datefmt": "%H:%M:%S"
            },
            "json": {
                "()": JsonFormatter
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": level,
                "stream": sys.stdout,
                "filters": ["ctx"],
                "formatter": "json" if is_prod else "dev"
            }
        },
        "loggers": {
            # seu app
            "": {  # root
                "handlers": handlers,
                "level": level,
                "propagate": False
            },
            # Uvicorn
            "uvicorn": {"handlers": handlers, "level": level, "propagate": False},
            "uvicorn.error": {"handlers": handlers, "level": level, "propagate": False},
            "uvicorn.access": {"handlers": handlers, "level": level, "propagate": False},
            # SQLAlchemy (se quiser reduzir verbosidade, ajuste para WARNING)
            "sqlalchemy.engine": {
                "handlers": handlers, 
                "level": "WARNING",
                "propagate": False
            },
        }
    }
    logging.config.dictConfig(dict_config)

def get_logger(name: str = __name__) -> logging.Logger:
    return logging.getLogger(name)

# Middleware para popular o contexto dos logs
async def logging_context_middleware(request, call_next):
    rid = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request_id_var.set(rid)
    client_ip_var.set(request.client.host if request.client else "-")
    path_var.set(request.url.path)
    method_var.set(request.method)
    user_agent_var.set(request.headers.get("User-Agent", "-"))

    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    return response
