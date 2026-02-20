"""
Rotas estendidas para Skills (Knowledge, Materials, Config, Upload)
"""
from fastapi import APIRouter, status, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timedelta

from app.api.deps import get_current_active_user
from app.database.db import get_db
from app.database.models.user import User
from app.database.models.skill import (
    Skill,
    SkillKnowledge,
    SkillMaterial,
    SkillRetrievalConfig
)
from app.schemas.skill import (
    SkillKnowledgeCreate,
    SkillKnowledgeUpdate,
    SkillKnowledgeResponse,
    SkillMaterialCreate,
    SkillMaterialUpdate,
    SkillMaterialResponse,
    SkillRetrievalConfigCreate,
    SkillRetrievalConfigUpdate,
    SkillRetrievalConfigResponse,
    SkillValidationResponse,
    FileUploadResponse,
    SkillResponse,
    SkillCreate
)
from app.database.enum import ProcessingStatus
from app.services.storage import storage_service


router = APIRouter(
    prefix="/skill",
    tags=["skill"]
)

# ============= Knowledge Routes =============
@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_in: SkillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Criar uma nova skill"""
    skill = Skill(
        name=skill_in.name,
        slug=skill_in.slug,
        description=skill_in.description,
        skill=skill_in.skill,
        status=skill_in.status,
        use=skill_in.use,
        workspace_id=skill_in.workspace_id,
        created_by_id=current_user.id,
        updated_by_id=current_user.id
    )
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill

# ============= Knowledge Routes =============

@router.post("/{skill_id}/knowledge", response_model=SkillKnowledgeResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge(
    skill_id: int,
    knowledge_in: SkillKnowledgeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Adicionar fonte de conhecimento"""
    # Verificar se skill existe
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill não encontrada")
    
    # Criar knowledge
    knowledge = SkillKnowledge(
        skill_id=skill_id,
        source_type=knowledge_in.source_type,
        name=knowledge_in.name,
        content=knowledge_in.content,
        s3_bucket=knowledge_in.s3_bucket,
        s3_key=knowledge_in.s3_key,
        s3_region=knowledge_in.s3_region,
        s3_url=knowledge_in.s3_url,
        file_name=knowledge_in.file_name,
        file_size=knowledge_in.file_size,
        file_mime_type=knowledge_in.file_mime_type,
        file_hash=knowledge_in.file_hash,
        file_extension=knowledge_in.file_extension,
        processing_status=ProcessingStatus.PENDING
    )
    
    db.add(knowledge)
    await db.commit()
    await db.refresh(knowledge)
    
    # TODO: Disparar job assíncrono para processar documento
    # process_document_async.delay(knowledge.id)
    
    return knowledge


@router.get("/{skill_id}/knowledge", response_model=List[SkillKnowledgeResponse])
async def list_knowledge(
    skill_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Listar fontes de conhecimento de uma skill"""
    result = await db.execute(
        select(SkillKnowledge).where(SkillKnowledge.skill_id == skill_id)
    )
    knowledges = result.scalars().all()
    return knowledges


@router.get("/knowledge/{knowledge_id}", response_model=SkillKnowledgeResponse)
async def get_knowledge(
    knowledge_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obter detalhes de uma fonte de conhecimento"""
    result = await db.execute(
        select(SkillKnowledge).where(SkillKnowledge.id == knowledge_id)
    )
    knowledge = result.scalar_one_or_none()
    if not knowledge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge não encontrado")
    return knowledge


@router.patch("/knowledge/{knowledge_id}", response_model=SkillKnowledgeResponse)
async def update_knowledge(
    knowledge_id: int,
    knowledge_in: SkillKnowledgeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Atualizar fonte de conhecimento"""
    result = await db.execute(
        select(SkillKnowledge).where(SkillKnowledge.id == knowledge_id)
    )
    knowledge = result.scalar_one_or_none()
    if not knowledge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge não encontrado")
    
    # Atualizar campos
    update_data = knowledge_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(knowledge, field, value)
    
    await db.commit()
    await db.refresh(knowledge)
    return knowledge


@router.delete("/knowledge/{knowledge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge(
    knowledge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Deletar fonte de conhecimento"""
    result = await db.execute(
        select(SkillKnowledge).where(SkillKnowledge.id == knowledge_id)
    )
    knowledge = result.scalar_one_or_none()
    if not knowledge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge não encontrado")
    
    # Deletar arquivo do S3 se existir
    if knowledge.s3_key:
        try:
            storage_service.delete_file(knowledge.s3_key)
        except Exception as e:
            print(f"Erro ao deletar arquivo do S3: {e}")
    
    await db.delete(knowledge)
    await db.commit()


# ============= Material Routes =============

@router.post("/{skill_id}/materials", response_model=SkillMaterialResponse, status_code=status.HTTP_201_CREATED)
async def create_material(
    skill_id: int,
    material_in: SkillMaterialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Adicionar material de apoio"""
    # Verificar se skill existe
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill não encontrada")
    
    # Criar material
    material = SkillMaterial(
        skill_id=skill_id,
        material_type=material_in.material_type,
        name=material_in.name,
        description=material_in.description,
        usage_context=material_in.usage_context,
        s3_bucket=material_in.s3_bucket,
        s3_key=material_in.s3_key,
        s3_region=material_in.s3_region,
        s3_url=material_in.s3_url,
        file_name=material_in.file_name,
        file_size=material_in.file_size,
        file_mime_type=material_in.file_mime_type,
        file_hash=material_in.file_hash,
        file_extension=material_in.file_extension,
        duration=material_in.duration,
        width=material_in.width,
        height=material_in.height,
        page_count=material_in.page_count,
        thumbnail_s3_key=material_in.thumbnail_s3_key
    )
    
    db.add(material)
    await db.commit()
    await db.refresh(material)
    
    return material


@router.get("/{skill_id}/materials", response_model=List[SkillMaterialResponse])
async def list_materials(
    skill_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Listar materiais de uma skill"""
    result = await db.execute(
        select(SkillMaterial).where(SkillMaterial.skill_id == skill_id)
    )
    materials = result.scalars().all()
    return materials


@router.get("/materials/{material_id}", response_model=SkillMaterialResponse)
async def get_material(
    material_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obter detalhes de um material"""
    result = await db.execute(
        select(SkillMaterial).where(SkillMaterial.id == material_id)
    )
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material não encontrado")
    
    # Gerar URL pré-assinada se necessário
    if material.s3_key:
        # Verificar se URL está expirada ou não existe
        if not material.s3_presigned_url or not material.presigned_url_expires_at or material.presigned_url_expires_at < datetime.utcnow():
            # Gerar nova URL pré-assinada (válida por 1 hora)
            presigned_url = storage_service.generate_presigned_url(material.s3_key, expiration=3600)
            material.s3_presigned_url = presigned_url
            material.presigned_url_expires_at = datetime.utcnow() + timedelta(hours=1)
            await db.commit()
            await db.refresh(material)
    
    return material


@router.patch("/materials/{material_id}", response_model=SkillMaterialResponse)
async def update_material(
    material_id: int,
    material_in: SkillMaterialUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Atualizar material"""
    result = await db.execute(
        select(SkillMaterial).where(SkillMaterial.id == material_id)
    )
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material não encontrado")
    
    # Atualizar campos
    update_data = material_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)
    
    await db.commit()
    await db.refresh(material)
    return material


@router.delete("/materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Deletar material"""
    result = await db.execute(
        select(SkillMaterial).where(SkillMaterial.id == material_id)
    )
    material = result.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material não encontrado")
    
    # Deletar arquivo do S3
    if material.s3_key:
        try:
            storage_service.delete_file(material.s3_key)
        except Exception as e:
            print(f"Erro ao deletar arquivo do S3: {e}")
    
    # Deletar thumbnail se existir
    if material.thumbnail_s3_key:
        try:
            storage_service.delete_file(material.thumbnail_s3_key)
        except Exception as e:
            print(f"Erro ao deletar thumbnail do S3: {e}")
    
    await db.delete(material)
    await db.commit()


# ============= Retrieval Config Routes =============

@router.post("/{skill_id}/retrieval-config", response_model=SkillRetrievalConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_retrieval_config(
    skill_id: int,
    config_in: SkillRetrievalConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Criar configuração de recuperação"""
    # Verificar se skill existe
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill não encontrada")
    
    # Verificar se já existe configuração
    result = await db.execute(
        select(SkillRetrievalConfig).where(SkillRetrievalConfig.skill_id == skill_id)
    )
    existing_config = result.scalar_one_or_none()
    if existing_config:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Configuração já existe")
    
    # Criar configuração
    config = SkillRetrievalConfig(
        skill_id=skill_id,
        parent_chunk_size=config_in.parent_chunk_size,
        child_chunk_size=config_in.child_chunk_size,
        chunk_overlap=config_in.chunk_overlap,
        max_results=config_in.max_results,
        similarity_threshold=config_in.similarity_threshold,
        embedding_model=config_in.embedding_model,
        embedding_dimensions=config_in.embedding_dimensions,
        qdrant_collection_name=config_in.qdrant_collection_name,
        advanced_config=config_in.advanced_config
    )
    
    db.add(config)
    await db.commit()
    await db.refresh(config)
    
    return config


@router.get("/{skill_id}/retrieval-config", response_model=SkillRetrievalConfigResponse)
async def get_retrieval_config(
    skill_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Obter configuração de recuperação"""
    result = await db.execute(
        select(SkillRetrievalConfig).where(SkillRetrievalConfig.skill_id == skill_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Configuração não encontrada")
    return config


@router.patch("/{skill_id}/retrieval-config", response_model=SkillRetrievalConfigResponse)
async def update_retrieval_config(
    skill_id: int,
    config_in: SkillRetrievalConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Atualizar configuração de recuperação"""
    result = await db.execute(
        select(SkillRetrievalConfig).where(SkillRetrievalConfig.skill_id == skill_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Configuração não encontrada")
    
    # Atualizar campos
    update_data = config_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    await db.commit()
    await db.refresh(config)
    return config


# ============= Upload Routes =============

@router.post("/{skill_id}/upload/knowledge", response_model=FileUploadResponse)
async def upload_knowledge_file(
    skill_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Upload de arquivo de conhecimento para S3"""
    # Verificar se skill existe
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill não encontrada")
    
    # Gerar chave de storage
    storage_key = storage_service.generate_key(
        workspace_id=skill.workspace_id,
        skill_id=skill_id,
        folder="knowledge",
        file_name=file.filename
    )
    
    # Upload para storage
    try:
        upload_result = storage_service.upload_file(
            file=file.file,
            key=storage_key,
            content_type=file.content_type
        )
        
        return FileUploadResponse(
            **upload_result,
            file_name=file.filename,
            file_mime_type=file.content_type or "application/octet-stream"
        )
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao fazer upload: {str(e)}")


@router.post("/{skill_id}/upload/material", response_model=FileUploadResponse)
async def upload_material_file(
    skill_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Upload de arquivo de material para S3"""
    # Verificar se skill existe
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill não encontrada")
    
    # Gerar chave de storage
    storage_key = storage_service.generate_key(
        workspace_id=skill.workspace_id,
        skill_id=skill_id,
        folder="materials",
        file_name=file.filename
    )
    
    # Upload para storage
    try:
        upload_result = storage_service.upload_file(
            file=file.file,
            key=storage_key,
            content_type=file.content_type
        )
        
        return FileUploadResponse(
            **upload_result,
            file_name=file.filename,
            file_mime_type=file.content_type or "application/octet-stream"
        )
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro ao fazer upload: {str(e)}")


# ============= Validation Route =============

@router.get("/{skill_id}/validate", response_model=SkillValidationResponse)
async def validate_skill(
    skill_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Validar skill antes de ativar"""
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill não encontrada")
    
    errors = []
    
    # 1. Nome obrigatório
    if not skill.name or len(skill.name.strip()) == 0:
        errors.append("Nome da habilidade é obrigatório")
    
    # 2. Pelo menos uma fonte de conhecimento
    result = await db.execute(
        select(SkillKnowledge).where(SkillKnowledge.skill_id == skill_id)
    )
    knowledges = result.scalars().all()
    if len(knowledges) == 0:
        errors.append("Adicione pelo menos uma fonte de conhecimento")
    
    # 3. Verificar fontes pendentes
    pending_count = sum(1 for k in knowledges if k.processing_status in [ProcessingStatus.PENDING, ProcessingStatus.PROCESSING])
    if pending_count > 0:
        errors.append(f"Aguarde o processamento de {pending_count} fonte(s) de conhecimento")
    
    # 4. Verificar fontes com erro
    failed_knowledges = [k for k in knowledges if k.processing_status == ProcessingStatus.FAILED]
    if failed_knowledges:
        failed_names = [k.name for k in failed_knowledges]
        errors.append(f"Corrija os erros nas fontes: {', '.join(failed_names)}")
    
    # 5. Configuração deve existir
    result = await db.execute(
        select(SkillRetrievalConfig).where(SkillRetrievalConfig.skill_id == skill_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        errors.append("Configuração de recuperação não encontrada")
    
    return SkillValidationResponse(
        valid=len(errors) == 0,
        errors=errors
    )
