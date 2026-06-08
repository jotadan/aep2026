import os

from flask import Flask

from app.config.settings import get_config
from app.extensions import database, login_manager, migrate
from app.routes import registrar_blueprints


def create_app(config_classe=None):
    aplicacao = Flask(__name__)
    aplicacao.config.from_object(config_classe or get_config())

    os.makedirs(aplicacao.config["UPLOAD_DIR"], exist_ok=True)

    database.init_app(aplicacao)
    migrate.init_app(aplicacao, database)
    login_manager.init_app(aplicacao)

    from app import models
    from app.models.usuario import Usuario

    @login_manager.user_loader
    def carregar_usuario(usuario_id):
        return database.session.get(Usuario, int(usuario_id))

    registrar_blueprints(aplicacao)
    registrar_comandos(aplicacao)

    return aplicacao


def registrar_comandos(aplicacao):
    from app.seed import semear_dados_iniciais

    @aplicacao.cli.command("seed")
    def seed():
        semear_dados_iniciais()
