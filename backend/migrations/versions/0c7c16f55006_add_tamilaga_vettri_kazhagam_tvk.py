"""add_tamilaga_vettri_kazhagam_tvk

Revision ID: 0c7c16f55006
Revises: c69132e7354f
Create Date: 2026-10-01 16:11:58.937949

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column, select


# revision identifiers, used by Alembic.
revision: str = '0c7c16f55006'
down_revision: Union[str, Sequence[str], None] = 'c69132e7354f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Reference table representation for safe data migration
parties_table = table(
    'parties',
    column('id', sa.Integer),
    column('name', sa.String),
    column('abbreviation', sa.String),
    column('symbol', sa.String),
    column('logo_url', sa.String),
    column('color', sa.String),
    column('description', sa.Text),
)


def upgrade() -> None:
    """Safely and idempotently adds Tamilaga Vettri Kazhagam (TVK) to parties."""
    conn = op.get_bind()

    # Check if TVK already exists by abbreviation or name
    result = conn.execute(
        select(parties_table.c.id).where(
            sa.or_(
                parties_table.c.abbreviation == 'TVK',
                parties_table.c.name == 'Tamilaga Vettri Kazhagam'
            )
        )
    ).first()

    if not result:
        op.bulk_insert(
            parties_table,
            [
                {
                    'name': 'Tamilaga Vettri Kazhagam',
                    'abbreviation': 'TVK',
                    'symbol': 'Whistle',
                    'logo_url': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200',
                    'color': '#8E24AA',
                    'description': 'Political party founded in 2024 by Vijay championing secular social democracy.',
                }
            ]
        )


def downgrade() -> None:
    """Reversibly removes TVK record if no candidate dependencies exist."""
    conn = op.get_bind()
    # Check if any candidates reference TVK
    candidates_table = table(
        'candidates',
        column('id', sa.Integer),
        column('party_id', sa.Integer)
    )
    
    tvk_party = conn.execute(
        select(parties_table.c.id).where(parties_table.c.abbreviation == 'TVK')
    ).first()

    if tvk_party:
        tvk_id = tvk_party[0]
        cand_count = conn.execute(
            select(sa.func.count(candidates_table.c.id)).where(candidates_table.c.party_id == tvk_id)
        ).scalar() or 0

        # Only delete if no candidates are linked, preserving referential integrity
        if cand_count == 0:
            conn.execute(
                parties_table.delete().where(parties_table.c.id == tvk_id)
            )
