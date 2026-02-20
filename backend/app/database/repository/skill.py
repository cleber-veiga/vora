from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.skill import (
    Skill,
    SkillKnowledge,
)
from app.database.repository.base import BaseRepository

class SkillRepository(BaseRepository[Skill]):
    def __init__(self, db: AsyncSession):
        super().__init__(Skill, db)

class SkillKnowledgeRepository(BaseRepository[SkillKnowledge]):
    def __init__(self, db: AsyncSession):
        super().__init__(SkillKnowledge, db)


