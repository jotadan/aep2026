from datetime import date

from app.extensions import database
from app.models.denuncia import Denuncia
from app.models.status_denuncia import StatusDenuncia


class DenunciaRepository:
    def listar_por_usuario_mais_antigas_primeiro(self, usuario_id):
        return list(
            database.session.execute(
                database.select(Denuncia)
                .filter_by(usuario_id=usuario_id)
                .order_by(Denuncia.criado_em.asc(), Denuncia.id.asc())
            ).scalars()
        )

    def listar_todas_mais_recentes_primeiro(self):
        return list(
            database.session.execute(
                database.select(Denuncia).order_by(
                    Denuncia.criado_em.desc(), Denuncia.id.desc()
                )
            ).scalars()
        )

    def buscar_por_protocolo_qualquer_usuario(self, protocolo):
        return database.session.execute(
            database.select(Denuncia).filter_by(protocolo=protocolo)
        ).scalar_one_or_none()

    def listar_status_ordenados(self):
        return list(
            database.session.execute(
                database.select(StatusDenuncia).order_by(StatusDenuncia.ordem.asc())
            ).scalars()
        )

    def contagem_por_status(self):
        linhas = database.session.execute(
            database.select(
                StatusDenuncia.codigo, database.func.count(Denuncia.id)
            )
            .select_from(StatusDenuncia)
            .outerjoin(Denuncia, Denuncia.status_id == StatusDenuncia.id)
            .group_by(StatusDenuncia.codigo)
        ).all()
        return {codigo: total for codigo, total in linhas}

    def contar_todas(self):
        return database.session.execute(
            database.select(database.func.count(Denuncia.id))
        ).scalar_one()

    def buscar_por_protocolo(self, protocolo, usuario_id):
        return database.session.execute(
            database.select(Denuncia).filter_by(protocolo=protocolo, usuario_id=usuario_id)
        ).scalar_one_or_none()

    def contar_protocolos_do_ano(self, ano):
        prefixo = f"ECO-{ano}-"
        return database.session.execute(
            database.select(database.func.count(Denuncia.id)).where(
                Denuncia.protocolo.like(f"{prefixo}%")
            )
        ).scalar_one()

    def salvar(self, denuncia):
        database.session.add(denuncia)
        database.session.commit()
        return denuncia

    def buscar_status_por_codigo(self, codigo):
        return database.session.execute(
            database.select(StatusDenuncia).filter_by(codigo=codigo)
        ).scalar_one_or_none()

    def resumo_por_usuario(self, usuario_id):
        denuncias = self.listar_por_usuario_mais_antigas_primeiro(usuario_id)
        total = len(denuncias)
        concluidas = sum(1 for d in denuncias if d.status and d.status.codigo == "concluida")
        ativas = total - concluidas
        return {"total": total, "ativas": ativas, "concluidas": concluidas}
