from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import database


class Usuario(UserMixin, database.Model):
    __tablename__ = "usuarios"

    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(120), nullable=False)
    email = database.Column(database.String(255), unique=True, nullable=False, index=True)
    senha_hash = database.Column(database.String(255), nullable=False)
    avatar = database.Column(database.String(255), default="imagens/avatar.png")
    titulo = database.Column(database.String(80), default="Cidadão Ativo")
    is_admin = database.Column(database.Boolean, nullable=False, default=False)
    criado_em = database.Column(database.DateTime, default=datetime.utcnow)

    denuncias = database.relationship(
        "Denuncia", back_populates="usuario", cascade="all, delete-orphan"
    )

    def definir_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
