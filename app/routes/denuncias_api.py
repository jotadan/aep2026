from flask import Blueprint, current_app, jsonify, request
from flask_login import current_user, login_required

from app.services.armazenamento_fotos_service import ArmazenamentoFotosService
from app.services.denuncia_service import DenunciaService

denuncias_api = Blueprint("denuncias_api", __name__, url_prefix="/api/denuncias")


def _criar_servico():
    armazenamento = ArmazenamentoFotosService(
        current_app.config["UPLOAD_DIR"],
        current_app.config["ALLOWED_IMAGE_EXTENSIONS"],
    )
    return DenunciaService(armazenamento_fotos_service=armazenamento)


@denuncias_api.route("", methods=["GET"])
@login_required
def listar():
    servico = _criar_servico()
    return jsonify(servico.listar_denuncias_do_usuario(current_user.id))


@denuncias_api.route("", methods=["POST"])
@login_required
def criar():
    servico = _criar_servico()
    dados = {
        "categoria": request.form.get("categoria"),
        "categoria_rotulo": request.form.get("categoria_rotulo"),
        "descricao": request.form.get("descricao"),
        "endereco": request.form.get("endereco"),
        "latitude": request.form.get("latitude"),
        "longitude": request.form.get("longitude"),
        "volume": request.form.get("volume"),
        "data_ocorrencia": request.form.get("data_ocorrencia"),
    }
    if not dados["categoria"] or not dados["endereco"]:
        return jsonify({"erro": "Categoria e endereço são obrigatórios."}), 400
    arquivos_foto = request.files.getlist("fotos")
    denuncia = servico.criar_denuncia(current_user.id, dados, arquivos_foto)
    return jsonify({"protocolo": denuncia.protocolo}), 201


@denuncias_api.route("/<protocolo>", methods=["GET"])
@login_required
def detalhe(protocolo):
    servico = _criar_servico()
    resultado = servico.buscar_detalhe(protocolo, current_user.id)
    if not resultado:
        return jsonify({"erro": "Denúncia não encontrada."}), 404
    return jsonify(resultado)
