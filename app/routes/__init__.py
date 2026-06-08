from app.routes.admin import admin
from app.routes.admin_api import admin_api
from app.routes.autenticacao import autenticacao
from app.routes.denuncias_api import denuncias_api
from app.routes.estatisticas_api import estatisticas_api
from app.routes.paginas import paginas


def registrar_blueprints(aplicacao):
    aplicacao.register_blueprint(paginas)
    aplicacao.register_blueprint(autenticacao)
    aplicacao.register_blueprint(denuncias_api)
    aplicacao.register_blueprint(estatisticas_api)
    aplicacao.register_blueprint(admin)
    aplicacao.register_blueprint(admin_api)
