from pydantic_settings import BaseSettings
from pydantic import Field, computed_field, field_validator
from typing import Optional, Literal, List

class Settings(BaseSettings):
    """Configurações da aplicação."""
    PROJECT_NAME: str = "ViaChat"
    DESCRIPTION: str = "Serviço de Chat pelo WhatsApp"
    VERSION: str = "1.0.0"
    ENVIRONMENT: Literal['dev', 'prod'] = Field(
        default='prod',
        description='Ambiente de execução'
    )

    # Configurações de segurança
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    SECRET_KEY: str = Field(default="CHANGE_ME_IN_PROD", description="Chave secreta para JWT")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = Field(default=None, description="Client ID do Google")
    GOOGLE_CLIENT_SECRET: Optional[str] = Field(default=None, description="Client Secret do Google")

    # PostgreSQL
    POSTGRES_URL: Optional[str] = Field(
        default="",
        description='URL de conexão com PostgreSQL'
    )

    # AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, description="AWS Access Key ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, description="AWS Secret Access Key")
    AWS_REGION: str = Field(default="us-east-1", description="AWS Region")
    S3_BUCKET_NAME: Optional[str] = Field(default=None, description="Nome do bucket S3")

    # Google Cloud Storage
    GCP_PROJECT_ID: Optional[str] = Field(default=None, description="Google Cloud Project ID")
    GCS_BUCKET_NAME: Optional[str] = Field(default=None, description="Nome do bucket GCS")
    GCS_CREDENTIALS_PATH: Optional[str] = Field(default=None, description="Caminho para o arquivo de credenciais JSON")
    
    # Storage Provider (s3 ou gcs)
    STORAGE_PROVIDER: str = Field(default="gcs", description="Provedor de storage: 's3' ou 'gcs'")

    #Log
    LOG_LEVEL: Literal['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'] = Field(
        default='INFO',
        description='Nível de log'
    )

    # --- Propriedades Computadas ---
    @computed_field
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @field_validator("ALLOWED_ORIGINS", "ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_csv_or_list(cls, value: object) -> List[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            if value.startswith("[") and value.endswith("]"):
                # Let pydantic handle JSON-style arrays.
                return value
            return [item.strip() for item in value.split(",") if item.strip()]
        return [str(value).strip()]

    class Config:   
            env_file = ".env"
            env_file_encoding = "utf-8"

settings = Settings()
