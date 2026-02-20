from __future__ import annotations

from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.repository.organization import OrganizationRepository, OrganizationMemberRepository
from app.database.repository.user import UserRepository
from app.database.models.organization import Organization, OrganizationMember
from app.schemas.organization import (
    OrganizationCreate, 
    OrganizationUpdate,
    OrganizationResponse, 
    OrganizationMemberResponse, 
    OrganizationMemberCreate,
    OrganizationMemberUpdate,
    OrganizationInvite,
    OrganizationMemberDetail,
    OrganizationWithUserRole,
    OrganizationWithUserRoleDetailed
)
from app.api.deps import get_current_active_user
from app.database.db import get_db
from app.database.models.user import User
from app.database.enum import OrgRole

router = APIRouter(
    prefix="/organization",
    tags=["Organization"]
)

# Organization
@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    organization_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = OrganizationRepository(db)
    member_repo = OrganizationMemberRepository(db)

    org = Organization(
        name=organization_in.name,
        slug=organization_in.slug,
    )
    created = await repo.create(org)

    owner_member = OrganizationMember(
        organization_id=created.id,
        user_id=current_user.id,
        role=OrgRole.OWNER,
    )
    await member_repo.create(owner_member)

    await db.commit()
    return created

@router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(
    organization_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = OrganizationRepository(db)
    org = await repo.get(organization_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organização não encontrada")
    return org

@router.get("/", response_model=list[OrganizationResponse])
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Lista TODAS as organizações (sem filtro de usuário).
    Use /me para listar apenas as organizações do usuário autenticado.
    """
    repo = OrganizationRepository(db)
    orgs = await repo.get_all(skip=skip, limit=limit)
    return orgs

@router.put("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: int,
    organization_in: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    member_repo = OrganizationMemberRepository(db)
    member = await member_repo.get_member(organization_id, current_user.id)
    
    if not member or member.role != OrgRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas donos podem editar a organização")

    repo = OrganizationRepository(db)
    updated = await repo.update(organization_id, organization_in.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organização não encontrada")
        
    await db.commit()
    return updated

@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    organization_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    member_repo = OrganizationMemberRepository(db)
    member = await member_repo.get_member(organization_id, current_user.id)
    
    if not member or member.role != OrgRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas donos podem excluir a organização")

    repo = OrganizationRepository(db)
    deleted = await repo.delete(organization_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organização não encontrada")
        
    await db.commit()

@router.get("/{organization_id}/members", response_model=list[OrganizationMemberDetail])
async def list_organization_members_by_id(
    organization_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Lista os membros de uma organização específica.
    O usuário deve ser membro da organização para ver a lista.
    """
    member_repo = OrganizationMemberRepository(db)
    
    # Verifica se o usuário atual é membro
    current_member = await member_repo.get_member(organization_id, current_user.id)
    if not current_member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não é membro desta organização")

    members = await member_repo.get_by_organization(organization_id, skip=skip, limit=limit)
    return members

@router.get("/me", response_model=list[OrganizationWithUserRole])
async def list_user_organizations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Lista apenas as organizações das quais o usuário autenticado é dono ou membro.
    
    Retorna a organização com o papel (role) do usuário nela:
    - OWNER: Pode deletar a org, gerir faturamento
    - ADMIN: Pode criar workspaces e convidar membros
    - MEMBER: Acesso básico, só entra onde for convidado
    """
    # Query que busca as organizações com o papel do usuário
    statement = (
        select(Organization, OrganizationMember.role)
        .join(OrganizationMember, Organization.id == OrganizationMember.organization_id)
        .where(OrganizationMember.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(statement)
    rows = result.all()
    
    # Transformar os resultados em objetos com o role incluído
    organizations_with_role = []
    for org, role in rows:
        # Adicionar o role como atributo do objeto Organization
        org.user_role = role
        organizations_with_role.append(org)
    
    return organizations_with_role

@router.get("/me/detailed", response_model=list[OrganizationWithUserRoleDetailed])
async def list_user_organizations_detailed(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Lista apenas as organizações do usuário com informações detalhadas.
    
    Inclui flags booleanas:
    - is_owner: True se o usuário é OWNER
    - is_admin: True se o usuário é ADMIN ou OWNER
    """
    # Query que busca as organizações com o papel do usuário
    statement = (
        select(Organization, OrganizationMember.role)
        .join(OrganizationMember, Organization.id == OrganizationMember.organization_id)
        .where(OrganizationMember.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(statement)
    rows = result.all()
    
    # Transformar os resultados com informações adicionais
    organizations_with_details = []
    for org, role in rows:
        org.user_role = role
        org.is_owner = role == OrgRole.OWNER
        org.is_admin = role in [OrgRole.ADMIN, OrgRole.OWNER]
        organizations_with_details.append(org)
    
    return organizations_with_details



# Organization Members
@router.post("/members", response_model=OrganizationMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_member(
    add_member_in: OrganizationMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = OrganizationMemberRepository(db)
    
    # Verifica se já existe
    existing_member = await repo.get_member(add_member_in.organization_id, add_member_in.user_id)
    if existing_member:
        raise HTTPException(status_code=400, detail="Usuário já é membro desta organização")

    # Cria novo membro
    new_member = OrganizationMember(
        organization_id=add_member_in.organization_id,
        user_id=add_member_in.user_id,
        role=add_member_in.role
    )
    created_member = await repo.create(new_member)
    await db.commit()
    
    return created_member

@router.post("/{organization_id}/invite", response_model=OrganizationMemberResponse, status_code=status.HTTP_201_CREATED)
async def invite_member(
    organization_id: int,
    invite_in: OrganizationInvite,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    member_repo = OrganizationMemberRepository(db)
    user_repo = UserRepository(db)
    
    # Check if current user is owner or admin
    current_member = await member_repo.get_member(organization_id, current_user.id)
    if not current_member or current_member.role not in [OrgRole.OWNER, OrgRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão negada")

    # Find user by email
    user = await user_repo.get_by_email(invite_in.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado com este email")

    # Check if already a member
    existing_member = await member_repo.get_member(organization_id, user.id)
    if existing_member:
        raise HTTPException(status_code=400, detail="Usuário já é membro desta organização")

    # Add member
    new_member = OrganizationMember(
        organization_id=organization_id,
        user_id=user.id,
        role=invite_in.role
    )
    created_member = await member_repo.create(new_member)
    await db.commit()
    
    return created_member


@router.get("/members", response_model=list[OrganizationMemberResponse])
async def list_organization_members(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = OrganizationMemberRepository(db)
    members = await repo.get_by_user(current_user.id)
    return members


@router.put("/{organization_id}/members/{user_id}", response_model=OrganizationMemberResponse)
async def update_member_role(
    organization_id: int,
    user_id: int,
    member_in: OrganizationMemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = OrganizationMemberRepository(db)
    
    # Check if current user is owner or admin of the organization
    current_member = await repo.get_member(organization_id, current_user.id)
    if not current_member or current_member.role not in [OrgRole.OWNER, OrgRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão negada")

    # Prevent removing last owner or changing last owner's role
    if member_in.role != OrgRole.OWNER:
        # Check if the target user is an owner and if they are the ONLY owner
        target_member = await repo.get_member(organization_id, user_id)
        if target_member and target_member.role == OrgRole.OWNER:
            # Count owners
            all_members = await repo.get_by_organization(organization_id)
            owners = [m for m in all_members if m.role == OrgRole.OWNER]
            if len(owners) <= 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível alterar o papel do único dono")

    updated_member = await repo.update((user_id, organization_id), member_in.model_dump(exclude_unset=True))
    if not updated_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado")
    
    await db.commit()
    return updated_member


@router.delete("/{organization_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    organization_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    repo = OrganizationMemberRepository(db)
    
    # Check permissions
    current_member = await repo.get_member(organization_id, current_user.id)
    if not current_member or current_member.role not in [OrgRole.OWNER, OrgRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão negada")

    # Prevent deleting yourself if you are the only owner (though frontend should block this too)
    target_member = await repo.get_member(organization_id, user_id)
    if not target_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado")

    if target_member.role == OrgRole.OWNER:
        all_members = await repo.get_by_organization(organization_id)
        owners = [m for m in all_members if m.role == OrgRole.OWNER]
        if len(owners) <= 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível remover o único dono")

    await repo.delete((user_id, organization_id))
    await db.commit()
    return None
