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

    def listar_todos(self):
        return list(
            database.session.execute(
                database.select(Usuario).order_by(Usuario.criado_em.asc())
            ).scalars()
        )

    def contar_denuncias_por_usuario(self):
        from app.models.denuncia import Denuncia

        linhas = database.session.execute(
            database.select(Denuncia.usuario_id, database.func.count(Denuncia.id))
            .group_by(Denuncia.usuario_id)
        ).all()
        return {usuario_id: total for usuario_id, total in linhas}

    def salvar(self, usuario):
        database.session.add(usuario)
        database.session.commit()
        return usuario
