"""
Serviço de Google Cloud Storage (GCS) para manipulação de arquivos no bucket
"""
from google.cloud import storage
from google.cloud.exceptions import NotFound
import hashlib
import os
from typing import Optional, BinaryIO
from datetime import datetime, timedelta
from settings import settings


class GCSService:
    """Serviço para manipular arquivos no Google Cloud Storage"""
    
    def __init__(self):
        # Inicializar cliente GCS
        # Se GOOGLE_APPLICATION_CREDENTIALS estiver definido, usa automaticamente
        # Caso contrário, pode usar service account key JSON
        if settings.GCS_CREDENTIALS_PATH:
            self.client = storage.Client.from_service_account_json(
                settings.GCS_CREDENTIALS_PATH
            )
        else:
            # Usa Application Default Credentials (ADC)
            self.client = storage.Client(project=settings.GCP_PROJECT_ID)
        
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.bucket = self.client.bucket(self.bucket_name)
    
    def generate_gcs_key(
        self,
        workspace_id: int,
        skill_id: int,
        folder: str,  # 'knowledge' ou 'materials'
        file_name: str,
        entity_id: Optional[int] = None
    ) -> str:
        """
        Gera uma chave GCS organizada
        
        Formato: workspaces/{workspace_id}/skills/{skill_id}/{folder}/{entity_id}/{file_name}
        Exemplo: workspaces/1/skills/123/knowledge/456/manual.pdf
        """
        if entity_id:
            return f"workspaces/{workspace_id}/skills/{skill_id}/{folder}/{entity_id}/{file_name}"
        else:
            return f"workspaces/{workspace_id}/skills/{skill_id}/{folder}/{file_name}"
    
    def upload_file(
        self,
        file: BinaryIO,
        gcs_key: str,
        content_type: Optional[str] = None
    ) -> dict:
        """
        Upload de arquivo para GCS
        
        Returns:
            dict: {
                'gcs_key': str,
                'gcs_url': str,
                'gcs_bucket': str,
                'file_size': int,
                'file_hash': str
            }
        """
        try:
            # Ler conteúdo do arquivo
            file_content = file.read()
            file_size = len(file_content)
            
            # Calcular hash SHA-256
            file_hash = hashlib.sha256(file_content).hexdigest()
            
            # Upload para GCS
            blob = self.bucket.blob(gcs_key)
            
            if content_type:
                blob.content_type = content_type
            
            blob.upload_from_string(file_content)
            
            # Gerar URL pública (se bucket for público) ou usar gsutil URI
            gcs_url = f"gs://{self.bucket_name}/{gcs_key}"
            
            # Alternativa: URL pública (se bucket configurado como público)
            # gcs_url = blob.public_url
            
            return {
                'gcs_key': gcs_key,
                'gcs_url': gcs_url,
                'gcs_bucket': self.bucket_name,
                'file_size': file_size,
                'file_hash': file_hash
            }
            
        except Exception as e:
            raise Exception(f"Erro ao fazer upload para GCS: {str(e)}")
    
    def download_file(self, gcs_key: str) -> bytes:
        """
        Download de arquivo do GCS
        
        Returns:
            bytes: Conteúdo do arquivo
        """
        try:
            blob = self.bucket.blob(gcs_key)
            return blob.download_as_bytes()
            
        except NotFound:
            raise Exception(f"Arquivo não encontrado: {gcs_key}")
        except Exception as e:
            raise Exception(f"Erro ao fazer download do GCS: {str(e)}")
    
    def delete_file(self, gcs_key: str) -> bool:
        """
        Deletar arquivo do GCS
        
        Returns:
            bool: True se deletado com sucesso
        """
        try:
            blob = self.bucket.blob(gcs_key)
            blob.delete()
            return True
            
        except NotFound:
            # Arquivo já não existe
            return True
        except Exception as e:
            raise Exception(f"Erro ao deletar arquivo do GCS: {str(e)}")
    
    def generate_signed_url(
        self,
        gcs_key: str,
        expiration: int = 3600  # 1 hora
    ) -> str:
        """
        Gera URL assinada para acesso temporário
        
        Args:
            gcs_key: Chave do arquivo no GCS
            expiration: Tempo de expiração em segundos (padrão: 1 hora)
        
        Returns:
            str: URL assinada
        """
        try:
            blob = self.bucket.blob(gcs_key)
            
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(seconds=expiration),
                method="GET"
            )
            return url
            
        except Exception as e:
            raise Exception(f"Erro ao gerar URL assinada: {str(e)}")
    
    def file_exists(self, gcs_key: str) -> bool:
        """
        Verifica se arquivo existe no GCS
        
        Returns:
            bool: True se existe
        """
        try:
            blob = self.bucket.blob(gcs_key)
            return blob.exists()
            
        except Exception:
            return False
    
    def get_file_metadata(self, gcs_key: str) -> dict:
        """
        Obtém metadados do arquivo no GCS
        
        Returns:
            dict: {
                'size': int,
                'updated': datetime,
                'content_type': str
            }
        """
        try:
            blob = self.bucket.blob(gcs_key)
            blob.reload()  # Carregar metadados
            
            return {
                'size': blob.size,
                'updated': blob.updated,
                'content_type': blob.content_type or 'application/octet-stream'
            }
            
        except NotFound:
            raise Exception(f"Arquivo não encontrado: {gcs_key}")
        except Exception as e:
            raise Exception(f"Erro ao obter metadados do arquivo: {str(e)}")
    
    def list_files(self, prefix: str) -> list:
        """
        Lista arquivos com determinado prefixo
        
        Args:
            prefix: Prefixo para filtrar (ex: "workspaces/1/skills/123/")
        
        Returns:
            list: Lista de dicts com informações dos arquivos
        """
        try:
            blobs = self.client.list_blobs(self.bucket_name, prefix=prefix)
            
            files = []
            for blob in blobs:
                files.append({
                    'gcs_key': blob.name,
                    'size': blob.size,
                    'updated': blob.updated
                })
            
            return files
            
        except Exception as e:
            raise Exception(f"Erro ao listar arquivos: {str(e)}")
    
    def copy_file(self, source_key: str, dest_key: str) -> bool:
        """
        Copia arquivo dentro do GCS
        
        Returns:
            bool: True se copiado com sucesso
        """
        try:
            source_blob = self.bucket.blob(source_key)
            dest_blob = self.bucket.blob(dest_key)
            
            # Copiar blob
            token = None
            while True:
                token, bytes_rewritten, total_bytes = dest_blob.rewrite(
                    source_blob, token=token
                )
                if token is None:
                    break
            
            return True
            
        except Exception as e:
            raise Exception(f"Erro ao copiar arquivo: {str(e)}")
    
    def get_file_hash(self, file: BinaryIO) -> str:
        """
        Calcula hash SHA-256 de um arquivo
        
        Returns:
            str: Hash SHA-256
        """
        file_content = file.read()
        file.seek(0)  # Reset file pointer
        return hashlib.sha256(file_content).hexdigest()
    
    def make_public(self, gcs_key: str) -> str:
        """
        Torna um arquivo público e retorna URL pública
        
        Returns:
            str: URL pública
        """
        try:
            blob = self.bucket.blob(gcs_key)
            blob.make_public()
            return blob.public_url
            
        except Exception as e:
            raise Exception(f"Erro ao tornar arquivo público: {str(e)}")


# Instância global do serviço
gcs_service = GCSService()
