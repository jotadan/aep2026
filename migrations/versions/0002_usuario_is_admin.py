from alembic import op
import sqlalchemy as sa

revision = "0002_usuario_is_admin"
down_revision = "0001_estrutura_inicial"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "usuarios",
        sa.Column(
            "is_admin",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    # Remove o default no nível do banco; o default passa a ser controlado pela aplicação.
    op.alter_column("usuarios", "is_admin", server_default=None)


def downgrade():
    op.drop_column("usuarios", "is_admin")
