from flask import Blueprint, jsonify
from flask_login import current_user, login_required

from app.services.denuncia_service import DenunciaService

estatisticas_api = Blueprint("estatisticas_api", __name__, url_prefix="/api/estatisticas")


@estatisticas_api.route("", methods=["GET"])
@login_required
def resumo():
    servico = DenunciaService()
    return jsonify(servico.resumo_do_usuario(current_user.id))
