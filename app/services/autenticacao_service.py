from app.models.usuario import Usuario
from app.repositories.usuario_repository import UsuarioRepository


class EmailJaCadastradoError(Exception):
    pass


class CredenciaisInvalidasError(Exception):
    pass


class AutenticacaoService:
    def __init__(self, usuario_repository=None):
        self.usuario_repository = usuario_repository or UsuarioRepository()

    def registrar(self, nome, email, senha):
        email_normalizado = email.strip().lower()
        if self.usuario_repository.buscar_por_email(email_normalizado):
            raise EmailJaCadastradoError("Este e-mail já está cadastrado.")
        usuario = Usuario(nome=nome.strip(), email=email_normalizado)
        usuario.definir_senha(senha)
        return self.usuario_repository.criar(usuario)

    def autenticar(self, email, senha):
        usuario = self.usuario_repository.buscar_por_email(email.strip().lower())
        if not usuario or not usuario.verificar_senha(senha):
            raise CredenciaisInvalidasError("E-mail ou senha inválidos.")
        return usuario
