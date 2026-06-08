from flask import Blueprint, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_user, logout_user

from app.services.autenticacao_service import (
    AutenticacaoService,
    CredenciaisInvalidasError,
    EmailJaCadastradoError,
)

autenticacao = Blueprint("autenticacao", __name__)
servico = AutenticacaoService()


@autenticacao.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("paginas.inicio"))
    if request.method == "POST":
        email = request.form.get("email", "")
        senha = request.form.get("senha", "")
        try:
            usuario = servico.autenticar(email, senha)
            login_user(usuario)
            return redirect(url_for("paginas.inicio"))
        except CredenciaisInvalidasError as erro:
            flash(str(erro), "danger")
    return render_template("login.html")


@autenticacao.route("/registro", methods=["GET", "POST"])
def registro():
    if current_user.is_authenticated:
        return redirect(url_for("paginas.inicio"))
    if request.method == "POST":
        nome = request.form.get("nome", "")
        email = request.form.get("email", "")
        senha = request.form.get("senha", "")
        if not nome or not email or len(senha) < 6:
            flash("Preencha todos os campos. A senha precisa ter ao menos 6 caracteres.", "danger")
            return render_template("registro.html")
        try:
            usuario = servico.registrar(nome, email, senha)
            login_user(usuario)
            return redirect(url_for("paginas.inicio"))
        except EmailJaCadastradoError as erro:
            flash(str(erro), "danger")
    return render_template("registro.html")


@autenticacao.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("autenticacao.login"))
