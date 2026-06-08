from app.extensions import database
from app.models.historico_denuncia import HistoricoDenuncia
from app.repositories.denuncia_repository import DenunciaRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.services.denuncia_service import DenunciaService


class DenunciaNaoEncontradaError(Exception):
    pass


class StatusInvalidoError(Exception):
    pass


class OperacaoNaoPermitidaError(Exception):
    pass


class AdminService:
    """Regras de negócio do painel administrativo: visão global das denúncias,
    atualização de status (com histórico), estatísticas e gestão de usuários."""

    def __init__(self, denuncia_repository=None, usuario_repository=None, denuncia_service=None):
        self.denuncia_repository = denuncia_repository or DenunciaRepository()
        self.usuario_repository = usuario_repository or UsuarioRepository()
        self.denuncia_service = denuncia_service or DenunciaService(
            denuncia_repository=self.denuncia_repository
        )

    # ----- Denúncias -----------------------------------------------------
    def listar_denuncias(self):
        denuncias = self.denuncia_repository.listar_todas_mais_recentes_primeiro()
        return [self._serializar_resumo_admin(d) for d in denuncias]

    def buscar_detalhe(self, protocolo):
        denuncia = self.denuncia_repository.buscar_por_protocolo_qualquer_usuario(protocolo)
        if not denuncia:
            return None
        detalhe = self.denuncia_service._serializar_detalhe(denuncia)
        detalhe["denunciante"] = {
            "nome": denuncia.usuario.nome if denuncia.usuario else None,
            "email": denuncia.usuario.email if denuncia.usuario else None,
        }
        return detalhe

    def atualizar_status(self, protocolo, codigo_status, observacao=None):
        denuncia = self.denuncia_repository.buscar_por_protocolo_qualquer_usuario(protocolo)
        if not denuncia:
            raise DenunciaNaoEncontradaError("Denúncia não encontrada.")

        novo_status = self.denuncia_repository.buscar_status_por_codigo(codigo_status)
        if not novo_status:
            raise StatusInvalidoError("Status inválido.")

        denuncia.status_id = novo_status.id
        denuncia.historicos.append(
            HistoricoDenuncia(
                status_id=novo_status.id,
                titulo=f"Status atualizado para {novo_status.rotulo}",
                descricao=(observacao or "").strip() or None,
            )
        )
        self.denuncia_repository.salvar(denuncia)
        return self.buscar_detalhe(protocolo)

    def listar_status(self):
        return [
            {"codigo": s.codigo, "rotulo": s.rotulo, "cor": s.cor, "ordem": s.ordem}
            for s in self.denuncia_repository.listar_status_ordenados()
        ]

    # ----- Estatísticas globais -----------------------------------------
    def estatisticas_globais(self):
        contagem = self.denuncia_repository.contagem_por_status()
        total = self.denuncia_repository.contar_todas()
        concluidas = contagem.get("concluida", 0)
        usuarios = self.usuario_repository.listar_todos()
        return {
            "total": total,
            "ativas": total - concluidas,
            "concluidas": concluidas,
            "por_status": contagem,
            "total_usuarios": len(usuarios),
            "impacto_kg": total * 25,
        }

    # ----- Usuários ------------------------------------------------------
    def listar_usuarios(self):
        usuarios = self.usuario_repository.listar_todos()
        contagem = self.usuario_repository.contar_denuncias_por_usuario()
        return [
            {
                "id": u.id,
                "nome": u.nome,
                "email": u.email,
                "titulo": u.titulo,
                "is_admin": u.is_admin,
                "total_denuncias": contagem.get(u.id, 0),
                "criado_em": u.criado_em.strftime("%d/%m/%Y") if u.criado_em else None,
            }
            for u in usuarios
        ]

    def definir_admin(self, usuario_id, tornar_admin, solicitante_id):
        usuario = self.usuario_repository.buscar_por_id(usuario_id)
        if not usuario:
            raise OperacaoNaoPermitidaError("Usuário não encontrado.")
        if usuario.id == solicitante_id and not tornar_admin:
            raise OperacaoNaoPermitidaError(
                "Você não pode remover o seu próprio acesso de administrador."
            )
        usuario.is_admin = bool(tornar_admin)
        self.usuario_repository.salvar(usuario)
        return {"id": usuario.id, "is_admin": usuario.is_admin}

    # ----- Serialização --------------------------------------------------
    def _serializar_resumo_admin(self, denuncia):
        resumo = self.denuncia_service._serializar_resumo(denuncia)
        resumo["denunciante"] = denuncia.usuario.nome if denuncia.usuario else None
        resumo["denunciante_email"] = denuncia.usuario.email if denuncia.usuario else None
        return resumo
