from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Text
from sqlalchemy.orm import relationship

from app.database.db import Base
from app.database.enum import KanbanStatus


class KanbanBoard(Base):
    __tablename__ = "kanban_boards"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(KanbanStatus, values_callable=lambda x: [e.value for e in x]),
        default=KanbanStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    columns_count = Column(Integer, default=0, nullable=False)
    cards_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="boards")
    created_by = relationship("User", foreign_keys=[created_by_id])
    updated_by = relationship("User", foreign_keys=[updated_by_id])
    columns = relationship("KanbanColumn", back_populates="board", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<KanbanBoard(id={self.id}, name='{self.name}', workspace_id={self.workspace_id})>"
