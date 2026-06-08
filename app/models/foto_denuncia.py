from datetime import datetime

from app.extensions import database


class FotoDenuncia(database.Model):
    __tablename__ = "fotos_denuncia"

    id = database.Column(database.Integer, primary_key=True)
    denuncia_id = database.Column(
        database.Integer, database.ForeignKey("denuncias.id"), nullable=False, index=True
    )
    caminho_arquivo = database.Column(database.String(255), nullable=False)
    criado_em = database.Column(database.DateTime, default=datetime.utcnow)

    denuncia = database.relationship("Denuncia", back_populates="fotos")
