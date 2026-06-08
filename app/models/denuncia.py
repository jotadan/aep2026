from datetime import datetime

from app.extensions import database


class Denuncia(database.Model):
    __tablename__ = "denuncias"

    id = database.Column(database.Integer, primary_key=True)
    protocolo = database.Column(database.String(30), unique=True, nullable=False, index=True)
    usuario_id = database.Column(
        database.Integer, database.ForeignKey("usuarios.id"), nullable=False, index=True
    )
    status_id = database.Column(
        database.Integer, database.ForeignKey("status_denuncia.id"), nullable=False
    )
    categoria = database.Column(database.String(40), nullable=False)
    categoria_rotulo = database.Column(database.String(80), nullable=False)
    descricao = database.Column(database.Text, nullable=False)
    endereco = database.Column(database.String(255), nullable=False)
    latitude = database.Column(database.Float, nullable=True)
    longitude = database.Column(database.Float, nullable=True)
    volume = database.Column(database.String(40), nullable=True)
    data_ocorrencia = database.Column(database.Date, nullable=True)
    criado_em = database.Column(database.DateTime, default=datetime.utcnow, index=True)
    atualizado_em = database.Column(
        database.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    usuario = database.relationship("Usuario", back_populates="denuncias")
    status = database.relationship("StatusDenuncia", back_populates="denuncias")
    fotos = database.relationship(
        "FotoDenuncia", back_populates="denuncia", cascade="all, delete-orphan"
    )
    historicos = database.relationship(
        "HistoricoDenuncia",
        back_populates="denuncia",
        cascade="all, delete-orphan",
        order_by="HistoricoDenuncia.criado_em",
    )
