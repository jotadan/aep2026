from app.extensions import database


class StatusDenuncia(database.Model):
    __tablename__ = "status_denuncia"

    id = database.Column(database.Integer, primary_key=True)
    codigo = database.Column(database.String(40), unique=True, nullable=False, index=True)
    rotulo = database.Column(database.String(80), nullable=False)
    cor = database.Column(database.String(20), nullable=False)
    ordem = database.Column(database.Integer, nullable=False, default=0)

    denuncias = database.relationship("Denuncia", back_populates="status")
    historicos = database.relationship("HistoricoDenuncia", back_populates="status")
