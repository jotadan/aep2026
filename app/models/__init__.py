from app.models.denuncia import Denuncia
from app.models.foto_denuncia import FotoDenuncia
from app.models.historico_denuncia import HistoricoDenuncia
from app.models.status_denuncia import StatusDenuncia
from app.models.usuario import Usuario

__all__ = [
    "Usuario",
    "Denuncia",
    "StatusDenuncia",
    "HistoricoDenuncia",
    "FotoDenuncia",
]
