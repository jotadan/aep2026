from alembic import op
import sqlalchemy as sa

revision = "0001_estrutura_inicial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("senha_hash", sa.String(length=255), nullable=False),
        sa.Column("avatar", sa.String(length=255), nullable=True),
        sa.Column("titulo", sa.String(length=80), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"], unique=True)

    op.create_table(
        "status_denuncia",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("codigo", sa.String(length=40), nullable=False),
        sa.Column("rotulo", sa.String(length=80), nullable=False),
        sa.Column("cor", sa.String(length=20), nullable=False),
        sa.Column("ordem", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_status_denuncia_codigo", "status_denuncia", ["codigo"], unique=True)

    op.create_table(
        "denuncias",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("protocolo", sa.String(length=30), nullable=False),
        sa.Column("usuario_id", sa.Integer(), nullable=False),
        sa.Column("status_id", sa.Integer(), nullable=False),
        sa.Column("categoria", sa.String(length=40), nullable=False),
        sa.Column("categoria_rotulo", sa.String(length=80), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("endereco", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("volume", sa.String(length=40), nullable=True),
        sa.Column("data_ocorrencia", sa.Date(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=True),
        sa.Column("atualizado_em", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["usuario_id"], ["usuarios.id"]),
        sa.ForeignKeyConstraint(["status_id"], ["status_denuncia.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_denuncias_protocolo", "denuncias", ["protocolo"], unique=True)
    op.create_index("ix_denuncias_usuario_id", "denuncias", ["usuario_id"], unique=False)
    op.create_index("ix_denuncias_criado_em", "denuncias", ["criado_em"], unique=False)

    op.create_table(
        "historico_denuncia",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("denuncia_id", sa.Integer(), nullable=False),
        sa.Column("status_id", sa.Integer(), nullable=False),
        sa.Column("titulo", sa.String(length=120), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["denuncia_id"], ["denuncias.id"]),
        sa.ForeignKeyConstraint(["status_id"], ["status_denuncia.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_historico_denuncia_denuncia_id", "historico_denuncia", ["denuncia_id"], unique=False
    )

    op.create_table(
        "fotos_denuncia",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("denuncia_id", sa.Integer(), nullable=False),
        sa.Column("caminho_arquivo", sa.String(length=255), nullable=False),
        sa.Column("criado_em", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["denuncia_id"], ["denuncias.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_fotos_denuncia_denuncia_id", "fotos_denuncia", ["denuncia_id"], unique=False
    )


def downgrade():
    op.drop_index("ix_fotos_denuncia_denuncia_id", table_name="fotos_denuncia")
    op.drop_table("fotos_denuncia")
    op.drop_index("ix_historico_denuncia_denuncia_id", table_name="historico_denuncia")
    op.drop_table("historico_denuncia")
    op.drop_index("ix_denuncias_criado_em", table_name="denuncias")
    op.drop_index("ix_denuncias_usuario_id", table_name="denuncias")
    op.drop_index("ix_denuncias_protocolo", table_name="denuncias")
    op.drop_table("denuncias")
    op.drop_index("ix_status_denuncia_codigo", table_name="status_denuncia")
    op.drop_table("status_denuncia")
    op.drop_index("ix_usuarios_email", table_name="usuarios")
    op.drop_table("usuarios")
