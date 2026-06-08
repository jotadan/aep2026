from flask import Blueprint, redirect, render_template, url_for
from flask_login import login_required

paginas = Blueprint("paginas", __name__)


@paginas.route("/")
def raiz():
    return redirect(url_for("paginas.inicio"))


@paginas.route("/inicio")
@login_required
def inicio():
    return render_template("inicio.html")


@paginas.route("/nova-denuncia")
@login_required
def nova_denuncia():
    return render_template("denuncia.html")


@paginas.route("/nova-denuncia/categoria")
@login_required
def nova_denuncia_categoria():
    return render_template("denuncia_categoria.html")


@paginas.route("/nova-denuncia/detalhes")
@login_required
def nova_denuncia_detalhes():
    return render_template("denuncia_detalhes.html")


@paginas.route("/nova-denuncia/revisao")
@login_required
def nova_denuncia_revisao():
    return render_template("denuncia_revisao.html")


@paginas.route("/nova-denuncia/sucesso")
@login_required
def nova_denuncia_sucesso():
    return render_template("denuncia_sucesso.html")


@paginas.route("/nova-denuncia/falha")
@login_required
def nova_denuncia_falha():
    return render_template("denuncia_falha.html")


@paginas.route("/minhas-denuncias")
@login_required
def minhas_denuncias():
    return render_template("minhas-denuncias.html")


@paginas.route("/painel")
@login_required
def painel():
    return render_template("painel-pessoal.html")


@paginas.route("/educacao-ambiental")
@login_required
def educacao_ambiental():
    return render_template("educacao-ambiental.html")


@paginas.route("/locais-de-coleta")
@login_required
def locais_de_coleta():
    return render_template("locais-de-coleta.html")


@paginas.route("/perfil")
@login_required
def perfil():
    return render_template("perfil.html")


@paginas.route("/configuracoes")
@login_required
def configuracoes():
    return render_template("configuracoes.html")
