from functools import wraps

from flask import abort, jsonify, redirect, request, url_for
from flask_login import current_user


def admin_required(view):
    """Garante que apenas usuários autenticados e administradores acessem a rota.

    Para requisições de API (JSON) responde com 401/403; para páginas redireciona
    para o login ou retorna 403.
    """

    @wraps(view)
    def wrapper(*args, **kwargs):
        prefere_json = request.path.startswith("/api/")
        if not current_user.is_authenticated:
            if prefere_json:
                return jsonify({"erro": "Autenticação necessária."}), 401
            return redirect(url_for("autenticacao.login"))
        if not getattr(current_user, "is_admin", False):
            if prefere_json:
                return jsonify({"erro": "Acesso restrito a administradores."}), 403
            abort(403)
        return view(*args, **kwargs)

    return wrapper
