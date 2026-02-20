"""
Serviço unificado de storage que abstrai S3 e GCS
"""
from typing import Optional, BinaryIO
from settings import settings


class StorageService:
    """Serviço unificado que usa S3 ou GCS baseado na configuração"""
    
    def __init__(self):
        self.provider = settings.STORAGE_PROVIDER.lower()

        if self.provider == 'gcs':
            try:
                from .gcs_service import gcs_service
                self._service = gcs_service
                self._key_field = 'gcs_key'
                self._url_field = 'gcs_url'
                self._bucket_field = 'gcs_bucket'
            except Exception as exc:
                # Fallback para permitir subir a API sem credenciais GCS locais.
                self.provider = 's3'
                from .s3_service import s3_service
                self._service = s3_service
                self._key_field = 's3_key'
                self._url_field = 's3_url'
                self._bucket_field = 's3_bucket'
                print(f"[storage] GCS indisponível, usando fallback S3: {exc}")
        elif self.provider == 's3':
            from .s3_service import s3_service
            self._service = s3_service
            self._key_field = 's3_key'
            self._url_field = 's3_url'
            self._bucket_field = 's3_bucket'
        else:
            raise ValueError(f"Storage provider inválido: {self.provider}. Use 's3' ou 'gcs'")
    
    def generate_key(
        self,
        workspace_id: int,
        skill_id: int,
        folder: str,
        file_name: str,
        entity_id: Optional[int] = None
    ) -> str:
        """Gera chave de armazenamento"""
        if self.provider == 'gcs':
            return self._service.generate_gcs_key(workspace_id, skill_id, folder, file_name, entity_id)
        else:
            return self._service.generate_s3_key(workspace_id, skill_id, folder, file_name, entity_id)
    
    def upload_file(
        self,
        file: BinaryIO,
        key: str,
        content_type: Optional[str] = None
    ) -> dict:
        """
        Upload de arquivo
        
        Returns:
            dict com chaves normalizadas:
            {
                'key': str,
                'url': str,
                'bucket': str,
                'file_size': int,
                'file_hash': str
            }
        """
        result = self._service.upload_file(file, key, content_type)
        
        # Normalizar chaves de retorno
        return {
            'key': result.get(self._key_field) or result.get('key'),
            'url': result.get(self._url_field) or result.get('url'),
            'bucket': result.get(self._bucket_field) or result.get('bucket'),
            'file_size': result['file_size'],
            'file_hash': result['file_hash'],
            'provider': self.provider
        }
    
    def download_file(self, key: str) -> bytes:
        """Download de arquivo"""
        return self._service.download_file(key)
    
    def delete_file(self, key: str) -> bool:
        """Deletar arquivo"""
        return self._service.delete_file(key)
    
    def generate_presigned_url(self, key: str, expiration: int = 3600) -> str:
        """Gera URL pré-assinada/assinada"""
        if self.provider == 'gcs':
            return self._service.generate_signed_url(key, expiration)
        else:
            return self._service.generate_presigned_url(key, expiration)
    
    def file_exists(self, key: str) -> bool:
        """Verifica se arquivo existe"""
        return self._service.file_exists(key)
    
    def get_file_metadata(self, key: str) -> dict:
        """Obtém metadados do arquivo"""
        return self._service.get_file_metadata(key)
    
    def list_files(self, prefix: str) -> list:
        """Lista arquivos com prefixo"""
        return self._service.list_files(prefix)
    
    def copy_file(self, source_key: str, dest_key: str) -> bool:
        """Copia arquivo"""
        return self._service.copy_file(source_key, dest_key)
    
    def get_file_hash(self, file: BinaryIO) -> str:
        """Calcula hash do arquivo"""
        return self._service.get_file_hash(file)


# Instância global do serviço unificado
storage_service = StorageService()
