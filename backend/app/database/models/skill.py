"""
Model: Skill (Habilidade)
"""
from sqlalchemy import (
    Column, 
    Integer, 
    String, 
    ForeignKey, 
    Enum, 
    DateTime, 
    Boolean, 
    Text, 
    BigInteger, 
    Numeric, 
    JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base
from app.database.enum import (
    TypeSkill, 
    StatusSkill, 
    UseSkill, 
    SourceType, 
    ProcessingStatus, 
    MaterialType, 
    ChunkType
)


class Skill(Base):
    __tablename__ = "skills"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Informações básicas
    name = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Tipo e status
    skill = Column(Enum(TypeSkill), default=TypeSkill.HARD, nullable=False, index=True)
    status = Column(Enum(StatusSkill), default=StatusSkill.ACTIVE, nullable=False, index=True)
    use = Column(Enum(UseSkill), default=UseSkill.REALEASED, nullable=False)
    
    # Soft delete
    is_deleted = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    workspace = relationship("Workspace", back_populates="skills")
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
    
    # Relacionamentos com outras tabelas de skills
    knowledges = relationship(
        "SkillKnowledge",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    materials = relationship(
        "SkillMaterial",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    retrieval_config = relationship(
        "SkillRetrievalConfig",
        back_populates="skill",
        uselist=False,  # 1:1 relationship
        cascade="all, delete-orphan"
    )
    chunks = relationship(
        "SkillChunk",
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )

    def __repr__(self):
        return f"<Skill(id={self.id}, name='{self.name}', workspace_id={self.workspace_id})>"


class SkillKnowledge(Base):
    __tablename__ = "skill_knowledges"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Tipo de fonte
    source_type = Column(Enum(SourceType), nullable=False, index=True)
    
    # Informações da fonte
    name = Column(String(500), nullable=False)
    
    # Para arquivos: referências ao S3
    s3_bucket = Column(String(255), nullable=True)
    s3_key = Column(String(1000), nullable=True, index=True)
    s3_region = Column(String(50), nullable=True)
    s3_url = Column(String(2000), nullable=True)
    
    # Para outros tipos: conteúdo direto
    content = Column(Text, nullable=True)
    
    # Metadados do arquivo
    file_name = Column(String(500), nullable=True)
    file_size = Column(BigInteger, nullable=True)  # Tamanho em bytes
    file_mime_type = Column(String(100), nullable=True)
    file_hash = Column(String(64), nullable=True, index=True)  # SHA-256
    file_extension = Column(String(10), nullable=True)
    
    # Metadados de processamento
    processing_status = Column(
        Enum(ProcessingStatus),
        default=ProcessingStatus.PENDING,
        nullable=False,
        index=True
    )
    processing_error = Column(Text, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    
    # Estatísticas
    total_chunks = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    skill = relationship("Skill", back_populates="knowledges")
    chunks = relationship(
        "SkillChunk",
        back_populates="knowledge_source",
        cascade="all, delete-orphan",
        lazy="dynamic"
    )
    
    def __repr__(self):
        return f"<SkillKnowledgeSource(id={self.id}, name='{self.name}', type={self.source_type})>"


class SkillMaterial(Base):
    __tablename__ = "skill_materials"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Tipo de material
    material_type = Column(Enum(MaterialType), nullable=False, index=True)
    
    # Informações do material
    name = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    usage_context = Column(Text, nullable=False)  # Quando usar este material
    
    # Referências ao S3
    s3_bucket = Column(String(255), nullable=False)
    s3_key = Column(String(1000), nullable=False, index=True)
    s3_region = Column(String(50), nullable=True)
    s3_url = Column(String(2000), nullable=True)
    s3_presigned_url = Column(Text, nullable=True)  # URL pré-assinada (cache)
    presigned_url_expires_at = Column(DateTime, nullable=True, index=True)
    
    # Metadados do arquivo
    file_name = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)  # Tamanho em bytes
    file_mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True)  # SHA-256
    file_extension = Column(String(10), nullable=True)
    
    # Metadados específicos por tipo
    duration = Column(Integer, nullable=True)  # Duração em segundos (vídeo/áudio)
    width = Column(Integer, nullable=True)  # Largura (imagem/vídeo)
    height = Column(Integer, nullable=True)  # Altura (imagem/vídeo)
    page_count = Column(Integer, nullable=True)  # Páginas (PDF)
    thumbnail_s3_key = Column(String(1000), nullable=True)  # Thumbnail
    
    # Estatísticas de uso
    usage_count = Column(Integer, default=0, nullable=False, index=True)
    last_used_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    skill = relationship("Skill", back_populates="materials")
    usage_logs = relationship(
        "SkillUsageLog",
        back_populates="material",
        lazy="dynamic"
    )
    
    def __repr__(self):
        return f"<SkillMaterial(id={self.id}, name='{self.name}', type={self.material_type})>"


class SkillRetrievalConfig(Base):
    __tablename__ = "skill_retrieval_configs"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Key (UNIQUE para garantir 1:1)
    skill_id = Column(
        Integer,
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    
    # Configurações de Parent-Child Chunking
    parent_chunk_size = Column(Integer, default=2048, nullable=False)  # Tokens
    child_chunk_size = Column(Integer, default=512, nullable=False)  # Tokens
    chunk_overlap = Column(Integer, default=128, nullable=False)  # Tokens
    
    # Configurações de recuperação
    max_results = Column(Integer, default=5, nullable=False)
    similarity_threshold = Column(Numeric(3, 2), default=0.70, nullable=False)  # 0.00 a 1.00
    
    # Estratégia de embedding
    embedding_model = Column(String(100), default="text-embedding-3-small", nullable=False)
    embedding_dimensions = Column(Integer, default=1536, nullable=False)
    
    # Configurações do Qdrant
    qdrant_collection_name = Column(String(255), default="skill_chunks", nullable=False)
    
    # Configurações avançadas (JSON)
    advanced_config = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    skill = relationship("Skill", back_populates="retrieval_config")
    
    def __repr__(self):
        return f"<SkillRetrievalConfig(id={self.id}, skill_id={self.skill_id}, parent_size={self.parent_chunk_size}, child_size={self.child_chunk_size})>"


class SkillUsageLog(Base):
    __tablename__ = "skill_usage_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    material_id = Column(Integer, ForeignKey("skill_materials.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Metadados de uso (opcional)
    metadata_log = Column(JSON, nullable=True)
    
    # Relacionamentos
    material = relationship("SkillMaterial", back_populates="usage_logs")
    user = relationship("User")

    def __repr__(self):
        return f"<SkillUsageLog(id={self.id}, material_id={self.material_id})>"


"""
Model: SkillChunk (Chunk de Conhecimento)
Armazena METADADOS dos chunks processados.
Embeddings são armazenados no Qdrant (não aqui!).
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base
from app.database.enum import ChunkType


class SkillChunk(Base):
    __tablename__ = "skill_chunks"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    knowledge_source_id = Column(
        Integer,
        ForeignKey("skill_knowledges.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Hierarquia Parent-Child
    chunk_type = Column(Enum(ChunkType), nullable=False, index=True)
    parent_chunk_id = Column(
        Integer,
        ForeignKey("skill_chunks.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    
    # Conteúdo (opcional: pode estar apenas no Qdrant)
    content = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True, index=True)  # SHA-256
    
    # Metadados
    token_count = Column(Integer, nullable=False)
    chunk_index = Column(Integer, nullable=False)  # Índice sequencial
    
    # Referência ao Qdrant
    qdrant_point_id = Column(String(100), nullable=False, index=True)  # Pode ser string UUID
    qdrant_collection = Column(String(255), default="skill_chunks", nullable=False)
    
    # Status de sincronização
    synced_to_qdrant = Column(Boolean, default=False, nullable=False, index=True)
    synced_at = Column(DateTime, nullable=True)
    
    # Metadados adicionais (também armazenados no Qdrant payload)
    mdata = Column(JSON, nullable=True)  # Ex: {"page": 1, "section": "intro"}
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamentos
    skill = relationship("Skill", back_populates="chunks")
    knowledge_source = relationship("SkillKnowledge", back_populates="chunks")
    
    # Self-referencing relationship (parent-child)
    parent_chunk = relationship(
        "SkillChunk",
        remote_side=[id],
        backref="child_chunks",
        foreign_keys=[parent_chunk_id]
    )
    
    def __repr__(self):
        return f"<SkillChunk(id={self.id}, type={self.chunk_type}, synced={self.synced_to_qdrant})>"
