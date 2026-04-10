"""create threat_events

Revision ID: 0001_create_threat_events
Revises: 
Create Date: 2026-04-10
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0001_create_threat_events"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "threat_events",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("method", sa.String(length=16), nullable=False),
        sa.Column("path", sa.String(length=2048), nullable=False),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("content_type", sa.String(length=256), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=False),
        sa.Column("classification", sa.String(length=16), nullable=False),
        sa.Column("threat_score", sa.Float(), nullable=False),
        sa.Column("attack_type", sa.String(length=32), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("explanations", sa.dialects.postgresql.JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("threat_events")

