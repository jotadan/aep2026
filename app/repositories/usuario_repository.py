from app.extensions import database
from app.models.usuario import Usuario


class UsuarioRepository:
    def buscar_por_id(self, usuario_id):
        return database.session.get(Usuario, usuario_id)

    def buscar_por_email(self, email):
        return database.session.execute(
            database.select(Usuario).filter_by(email=email)
        ).scalar_one_or_none()

    def criar(self, usuario):
        database.session.add(usuario)
        database.session.commit()
        return usuario
