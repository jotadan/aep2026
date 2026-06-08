from datetime import datetime

from app.extensions import database


class HistoricoDenuncia(database.Model):
    __tablename__ = "historico_denuncia"

    id = database.Column(database.Integer, primary_key=True)
    denuncia_id = database.Column(
        database.Integer, database.ForeignKey("denuncias.id"), nullable=False, index=True
    )
    status_id = database.Column(
        database.Integer, database.ForeignKey("status_denuncia.id"), nullable=False
    )
    titulo = database.Column(database.String(120), nullable=False)
    descricao = database.Column(database.Text, nullable=True)
    criado_em = database.Column(database.DateTime, default=datetime.utcnow)

    denuncia = database.relationship("Denuncia", back_populates="historicos")
    status = database.relationship("StatusDenuncia", back_populates="historicos")
