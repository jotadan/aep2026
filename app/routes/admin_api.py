from flask import Blueprint, jsonify, request
from flask_login import current_user

from app.routes.seguranca import admin_required
from app.services.admin_service import (
    AdminService,
    DenunciaNaoEncontradaError,
    OperacaoNaoPermitidaError,
    StatusInvalidoError,
)

admin_api = Blueprint("admin_api", __name__, url_prefix="/api/admin")


@admin_api.route("/denuncias", methods=["GET"])
@admin_required
def listar_denuncias():
    return jsonify(AdminService().listar_denuncias())


@admin_api.route("/denuncias/<protocolo>", methods=["GET"])
@admin_required
def detalhe_denuncia(protocolo):
    detalhe = AdminService().buscar_detalhe(protocolo)
    if not detalhe:
        return jsonify({"erro": "Denúncia não encontrada."}), 404
    return jsonify(detalhe)


@admin_api.route("/denuncias/<protocolo>/status", methods=["POST"])
@admin_required
def atualizar_status(protocolo):
    dados = request.get_json(silent=True) or {}
    codigo_status = dados.get("status")
    if not codigo_status:
        return jsonify({"erro": "Informe o novo status."}), 400
    try:
        atualizada = AdminService().atualizar_status(
            protocolo, codigo_status, dados.get("observacao")
        )
    except DenunciaNaoEncontradaError as erro:
        return jsonify({"erro": str(erro)}), 404
    except StatusInvalidoError as erro:
        return jsonify({"erro": str(erro)}), 400
    return jsonify(atualizada)


@admin_api.route("/status", methods=["GET"])
@admin_required
def listar_status():
    return jsonify(AdminService().listar_status())


@admin_api.route("/estatisticas", methods=["GET"])
@admin_required
def estatisticas():
    return jsonify(AdminService().estatisticas_globais())


@admin_api.route("/usuarios", methods=["GET"])
@admin_required
def listar_usuarios():
    return jsonify(AdminService().listar_usuarios())


@admin_api.route("/usuarios/<int:usuario_id>/admin", methods=["POST"])
@admin_required
def definir_admin(usuario_id):
    dados = request.get_json(silent=True) or {}
    tornar_admin = bool(dados.get("is_admin"))
    try:
        resultado = AdminService().definir_admin(
            usuario_id, tornar_admin, current_user.id
        )
    except OperacaoNaoPermitidaError as erro:
        return jsonify({"erro": str(erro)}), 400
    return jsonify(resultado)
