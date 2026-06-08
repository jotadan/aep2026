import pytest

from app import create_app
from app.config.settings import TestingConfig
from app.extensions import database
from app.seed import semear_status
from app.services.autenticacao_service import AutenticacaoService


@pytest.fixture
def app(tmp_path):
    class ConfigTeste(TestingConfig):
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{tmp_path / 'teste.db'}"
        UPLOAD_DIR = str(tmp_path / "uploads")

    aplicacao = create_app(ConfigTeste)
    with aplicacao.app_context():
        database.create_all()
        semear_status()
        AutenticacaoService().registrar("Usuário Teste", "teste@ecotech.com", "senha123")
        admin = AutenticacaoService().registrar(
            "Administrador", "admin@ecotech.com", "admin123"
        )
        admin.is_admin = True
        database.session.commit()
    yield aplicacao


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def cliente_logado(app):
    cliente = app.test_client()
    cliente.post("/login", data={"email": "teste@ecotech.com", "senha": "senha123"})
    return cliente


@pytest.fixture
def cliente_admin(app):
    cliente = app.test_client()
    cliente.post("/login", data={"email": "admin@ecotech.com", "senha": "admin123"})
    return cliente
