from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base
from app.database.enum import WorkspaceRole

class Workspace(Base):
    __tablename__ = "workspaces"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    credits = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relacionamentos
    organization = relationship("Organization", back_populates="workspaces")
    created_by = relationship("User", foreign_keys=[created_by_id]) 
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="workspace", cascade="all, delete-orphan")
    boards = relationship("KanbanBoard", back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceMember(Base):
    """
    Tabela de junção: User <-> Workspace
    Define direitos granulares dentro de um projeto/área específica.
    """
    __tablename__ = "workspace_members"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), primary_key=True)
    
    # Permissões específicas do Workspace
    role = Column(Enum(WorkspaceRole), default=WorkspaceRole.VIEWER, nullable=False)
    
    user = relationship("User", backref="workspace_memberships")
    workspace = relationship("Workspace", back_populates="members")
