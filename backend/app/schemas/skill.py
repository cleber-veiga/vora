"""
Schemas estendidos para Skills (Knowledge, Materials, Config)
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.database.enum import (
    SourceType,
    ProcessingStatus,
    MaterialType,
    TypeSkill,
    StatusSkill,
    UseSkill
)

# ============= Skill Schemas =============

class SkillBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    skill: TypeSkill
    status: StatusSkill = StatusSkill.DRAFT
    use: UseSkill = UseSkill.REALEASED
    workspace_id: int
    created_by_id: int
    updated_by_id: Optional[int] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Knowledge Schemas =============

class SkillKnowledgeBase(BaseModel):
    source_type: SourceType
    name: str
    content: Optional[str] = None


class SkillKnowledgeCreate(SkillKnowledgeBase):
    skill_id: int
    # Campos S3 (preenchidos após upload)
    s3_bucket: Optional[str] = None
    s3_key: Optional[str] = None
    s3_region: Optional[str] = None
    s3_url: Optional[str] = None
    # Metadados do arquivo
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_mime_type: Optional[str] = None
    file_hash: Optional[str] = None
    file_extension: Optional[str] = None


class SkillKnowledgeUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    processing_status: Optional[ProcessingStatus] = None
    processing_error: Optional[str] = None


class SkillKnowledgeResponse(SkillKnowledgeBase):
    id: int
    skill_id: int
    s3_bucket: Optional[str] = None
    s3_key: Optional[str] = None
    s3_region: Optional[str] = None
    s3_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_mime_type: Optional[str] = None
    file_hash: Optional[str] = None
    file_extension: Optional[str] = None
    processing_status: ProcessingStatus
    processing_error: Optional[str] = None
    processed_at: Optional[datetime] = None
    total_chunks: int
    total_tokens: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Material Schemas =============

class SkillMaterialBase(BaseModel):
    material_type: MaterialType
    name: str
    description: Optional[str] = None
    usage_context: str


class SkillMaterialCreate(SkillMaterialBase):
    skill_id: int
    # Campos S3 (preenchidos após upload)
    s3_bucket: str
    s3_key: str
    s3_region: Optional[str] = None
    s3_url: Optional[str] = None
    # Metadados do arquivo
    file_name: str
    file_size: int
    file_mime_type: str
    file_hash: str
    file_extension: Optional[str] = None
    # Metadados específicos
    duration: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    page_count: Optional[int] = None
    thumbnail_s3_key: Optional[str] = None


class SkillMaterialUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    usage_context: Optional[str] = None


class SkillMaterialResponse(SkillMaterialBase):
    id: int
    skill_id: int
    s3_bucket: str
    s3_key: str
    s3_region: Optional[str] = None
    s3_url: Optional[str] = None
    s3_presigned_url: Optional[str] = None
    presigned_url_expires_at: Optional[datetime] = None
    file_name: str
    file_size: int
    file_mime_type: str
    file_hash: str
    file_extension: Optional[str] = None
    duration: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    page_count: Optional[int] = None
    thumbnail_s3_key: Optional[str] = None
    usage_count: int
    last_used_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Retrieval Config Schemas =============

class SkillRetrievalConfigBase(BaseModel):
    parent_chunk_size: int = 2048
    child_chunk_size: int = 512
    chunk_overlap: int = 128
    max_results: int = 5
    similarity_threshold: float = 0.70
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    qdrant_collection_name: str = "skill_chunks"
    advanced_config: Optional[dict] = None


class SkillRetrievalConfigCreate(SkillRetrievalConfigBase):
    skill_id: int


class SkillRetrievalConfigUpdate(BaseModel):
    parent_chunk_size: Optional[int] = None
    child_chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
    max_results: Optional[int] = None
    similarity_threshold: Optional[float] = None
    embedding_model: Optional[str] = None
    embedding_dimensions: Optional[int] = None
    qdrant_collection_name: Optional[str] = None
    advanced_config: Optional[dict] = None


class SkillRetrievalConfigResponse(SkillRetrievalConfigBase):
    id: int
    skill_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Validation Schema =============

class SkillValidationResponse(BaseModel):
    valid: bool
    errors: list[str] = []


# ============= Upload Response =============

class FileUploadResponse(BaseModel):
    key: str  # storage key (s3_key ou gcs_key)
    url: str  # storage url
    bucket: str  # bucket name
    provider: str  # 's3' ou 'gcs'
    file_size: int
    file_hash: str
    file_name: str
    file_mime_type: str
