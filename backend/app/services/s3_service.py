"""
Serviço de S3 para manipulação de arquivos no bucket
"""
import boto3
import hashlib
import os
from typing import Optional, BinaryIO
from datetime import datetime, timedelta
from botocore.exceptions import ClientError
from settings import settings


class S3Service:
    """Serviço para manipular arquivos no S3"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME
        self.region = settings.AWS_REGION
    
    def generate_s3_key(
        self,
        workspace_id: int,
        skill_id: int,
        folder: str,  # 'knowledge' ou 'materials'
        file_name: str,
        entity_id: Optional[int] = None
    ) -> str:
        """
        Gera uma chave S3 organizada
        
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
        s3_key: str,
        content_type: Optional[str] = None
    ) -> dict:
        """
        Upload de arquivo para S3
        
        Returns:
            dict: {
                's3_key': str,
                's3_url': str,
                's3_bucket': str,
                's3_region': str,
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
            
            # Upload para S3
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_content,
                **extra_args
            )
            
            # Gerar URL pública
            s3_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_key}"
            
            return {
                's3_key': s3_key,
                's3_url': s3_url,
                's3_bucket': self.bucket_name,
                's3_region': self.region,
                'file_size': file_size,
                'file_hash': file_hash
            }
            
        except ClientError as e:
            raise Exception(f"Erro ao fazer upload para S3: {str(e)}")
    
    def download_file(self, s3_key: str) -> bytes:
        """
        Download de arquivo do S3
        
        Returns:
            bytes: Conteúdo do arquivo
        """
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return response['Body'].read()
            
        except ClientError as e:
            raise Exception(f"Erro ao fazer download do S3: {str(e)}")
    
    def delete_file(self, s3_key: str) -> bool:
        """
        Deletar arquivo do S3
        
        Returns:
            bool: True se deletado com sucesso
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
            
        except ClientError as e:
            raise Exception(f"Erro ao deletar arquivo do S3: {str(e)}")
    
    def generate_presigned_url(
        self,
        s3_key: str,
        expiration: int = 3600  # 1 hora
    ) -> str:
        """
        Gera URL pré-assinada para acesso temporário
        
        Args:
            s3_key: Chave do arquivo no S3
            expiration: Tempo de expiração em segundos (padrão: 1 hora)
        
        Returns:
            str: URL pré-assinada
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=expiration
            )
            return url
            
        except ClientError as e:
            raise Exception(f"Erro ao gerar URL pré-assinada: {str(e)}")
    
    def file_exists(self, s3_key: str) -> bool:
        """
        Verifica se arquivo existe no S3
        
        Returns:
            bool: True se existe
        """
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
            
        except ClientError:
            return False
    
    def get_file_metadata(self, s3_key: str) -> dict:
        """
        Obtém metadados do arquivo no S3
        
        Returns:
            dict: {
                'size': int,
                'last_modified': datetime,
                'content_type': str
            }
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            
            return {
                'size': response['ContentLength'],
                'last_modified': response['LastModified'],
                'content_type': response.get('ContentType', 'application/octet-stream')
            }
            
        except ClientError as e:
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
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        's3_key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified']
                    })
            
            return files
            
        except ClientError as e:
            raise Exception(f"Erro ao listar arquivos: {str(e)}")
    
    def copy_file(self, source_key: str, dest_key: str) -> bool:
        """
        Copia arquivo dentro do S3
        
        Returns:
            bool: True se copiado com sucesso
        """
        try:
            copy_source = {
                'Bucket': self.bucket_name,
                'Key': source_key
            }
            
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket_name,
                Key=dest_key
            )
            return True
            
        except ClientError as e:
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


# Instância global do serviço
s3_service = S3Service()
