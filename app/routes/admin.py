from flask import Blueprint, render_template

from app.routes.seguranca import admin_required

admin = Blueprint("admin", __name__, url_prefix="/admin")


@admin.route("")
@admin_required
def painel():
    return render_template("admin/dashboard.html")


@admin.route("/denuncias")
@admin_required
def denuncias():
    return render_template("admin/denuncias.html")


@admin.route("/usuarios")
@admin_required
def usuarios():
    return render_template("admin/usuarios.html")
