from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

database = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = "autenticacao.login"
login_manager.login_message = "Faça login para acessar esta página."
