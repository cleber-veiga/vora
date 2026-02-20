"""

Revision ID: 5b52d3d6c8a1
Revises: 3b1a2c7e9f4d
Create Date: 2026-02-20 10:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b52d3d6c8a1'
down_revision: Union[str, Sequence[str], None] = '3b1a2c7e9f4d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'kanban_columns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('board_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(length=20), nullable=True),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('is_required', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['board_id'], ['kanban_boards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kanban_columns_board_id'), 'kanban_columns', ['board_id'], unique=False)
    op.create_index(op.f('ix_kanban_columns_id'), 'kanban_columns', ['id'], unique=False)
    op.create_index(op.f('ix_kanban_columns_position'), 'kanban_columns', ['position'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_kanban_columns_position'), table_name='kanban_columns')
    op.drop_index(op.f('ix_kanban_columns_id'), table_name='kanban_columns')
    op.drop_index(op.f('ix_kanban_columns_board_id'), table_name='kanban_columns')
    op.drop_table('kanban_columns')
