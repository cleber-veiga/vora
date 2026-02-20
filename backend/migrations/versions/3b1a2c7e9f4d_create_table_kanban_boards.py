"""

Revision ID: 3b1a2c7e9f4d
Revises: 9201e8de9dba
Create Date: 2026-02-20 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b1a2c7e9f4d'
down_revision: Union[str, Sequence[str], None] = '9201e8de9dba'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'kanban_boards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('workspace_id', sa.Integer(), nullable=False),
        sa.Column('created_by_id', sa.Integer(), nullable=True),
        sa.Column('updated_by_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('active', 'inactive', 'archived', name='kanbanstatus'), nullable=False),
        sa.Column('columns_count', sa.Integer(), nullable=False),
        sa.Column('cards_count', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['updated_by_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kanban_boards_created_at'), 'kanban_boards', ['created_at'], unique=False)
    op.create_index(op.f('ix_kanban_boards_id'), 'kanban_boards', ['id'], unique=False)
    op.create_index(op.f('ix_kanban_boards_status'), 'kanban_boards', ['status'], unique=False)
    op.create_index(op.f('ix_kanban_boards_workspace_id'), 'kanban_boards', ['workspace_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_kanban_boards_workspace_id'), table_name='kanban_boards')
    op.drop_index(op.f('ix_kanban_boards_status'), table_name='kanban_boards')
    op.drop_index(op.f('ix_kanban_boards_id'), table_name='kanban_boards')
    op.drop_index(op.f('ix_kanban_boards_created_at'), table_name='kanban_boards')
    op.drop_table('kanban_boards')
