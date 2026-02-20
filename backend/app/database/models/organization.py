from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from app.database.db import Base
from app.database.enum import OrgRole

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)

    # Relacionamentos
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    workspaces = relationship("Workspace", back_populates="organization", cascade="all, delete-orphan")


class OrganizationMember(Base):
    """
    Tabela de junção: User <-> Organization
    Define quem faz parte da empresa.
    """
    __tablename__ = "organization_members"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), primary_key=True)
    role = Column(Enum(OrgRole), default=OrgRole.MEMBER, nullable=False)
    
    user = relationship("User", backref="org_memberships")
    organization = relationship("Organization", back_populates="members")