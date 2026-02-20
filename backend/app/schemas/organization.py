from pydantic import BaseModel
from typing import Optional
from app.database.enum import OrgRole


class OrganizationBase(BaseModel):
    name: str
    slug: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    id: int

    class Config:
        from_attributes = True


class OrganizationMemberBase(BaseModel):
    user_id: int
    organization_id: int
    role: OrgRole = OrgRole.MEMBER


class OrganizationMemberCreate(OrganizationMemberBase):
    pass


class OrganizationMemberUpdate(BaseModel):
    role: OrgRole


class OrganizationInvite(BaseModel):
    email: str
    role: OrgRole = OrgRole.MEMBER


class OrganizationMemberResponse(OrganizationMemberBase):
    class Config:
        from_attributes = True


class UserSimple(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class OrganizationMemberDetail(OrganizationMemberBase):
    user: UserSimple

    class Config:
        from_attributes = True


class OrganizationWithUserRole(OrganizationBase):
    """Schema que retorna uma organização com o papel do usuário nela."""
    id: int
    user_role: OrgRole  # O papel do usuário autenticado nesta organização

    class Config:
        from_attributes = True


class OrganizationWithUserRoleDetailed(OrganizationBase):
    """Schema mais detalhado que inclui informações da organização e do papel do usuário."""
    id: int
    user_role: OrgRole
    is_owner: bool  # True se o usuário é OWNER
    is_admin: bool  # True se o usuário é ADMIN ou OWNER

    class Config:
        from_attributes = True

