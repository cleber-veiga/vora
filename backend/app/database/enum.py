import enum

# Skills
class TypeSkill(str, enum.Enum):
    """Tipo de habilidade"""
    HARD = "hard"
    SOFT = "soft"


class StatusSkill(str, enum.Enum):
    """Status da habilidade"""
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"


class UseSkill(str, enum.Enum):
    """Uso da habilidade"""
    REALEASED = "realeased"
    PROCESSING = "processing"
    ERROR = "error"


class SourceType(str, enum.Enum):
    """Tipo de fonte de conhecimento"""
    FILE = "file"
    WEBSITE = "website"
    TEXT = "text"
    YOUTUBE = "youtube"


class ProcessingStatus(str, enum.Enum):
    """Status de processamento de fonte de conhecimento"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class MaterialType(str, enum.Enum):
    """Tipo de material de apoio"""
    PDF = "pdf"
    VIDEO = "video"
    AUDIO = "audio"
    IMAGE = "image"


class ChunkType(str, enum.Enum):
    """Tipo de chunk (Parent-Child)"""
    PARENT = "parent"
    CHILD = "child"


# Organizations
class OrgRole(str, enum.Enum):
    OWNER = "OWNER"       # Pode deletar a org, gerir faturamento
    ADMIN = "ADMIN"       # Pode criar workspaces e convidar membros
    MEMBER = "MEMBER"     # Acesso básico, só entra onde for convidado


# Workspaces
class WorkspaceRole(str, enum.Enum):
    MANAGER = "MANAGER"   # Pode adicionar agentes de IA, gerir membros do workspace
    EDITOR = "EDITOR"     # Pode criar chats, usar agentes
    VIEWER = "VIEWER"     # Somente visualização


# Kanban Boards
class KanbanStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
