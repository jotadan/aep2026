from datetime import date, datetime

from app.extensions import database
from app.models.denuncia import Denuncia
from app.models.foto_denuncia import FotoDenuncia
from app.models.historico_denuncia import HistoricoDenuncia
from app.repositories.denuncia_repository import DenunciaRepository
from app.structures.fila_denuncias import FilaDenuncias

ROTULOS_VOLUME = {
    "pequeno": "Pequeno (até 1 saco)",
    "medio": "Médio (1 a 5 sacos)",
    "grande": "Grande (5 a 10 sacos)",
    "muito_grande": "Muito grande (mais de 10 sacos)",
}


class DenunciaService:
    def __init__(self, denuncia_repository=None, armazenamento_fotos_service=None):
        self.denuncia_repository = denuncia_repository or DenunciaRepository()
        self.armazenamento_fotos_service = armazenamento_fotos_service

    def gerar_protocolo(self):
        ano = date.today().year
        sequencial = self.denuncia_repository.contar_protocolos_do_ano(ano) + 1
        return f"ECO-{ano}-{sequencial:06d}"

    def criar_denuncia(self, usuario_id, dados, arquivos_foto):
        status_inicial = self.denuncia_repository.buscar_status_por_codigo("recebida")
        protocolo = self.gerar_protocolo()

        data_ocorrencia = None
        if dados.get("data_ocorrencia"):
            data_ocorrencia = datetime.strptime(
                dados["data_ocorrencia"], "%Y-%m-%d"
            ).date()

        denuncia = Denuncia(
            protocolo=protocolo,
            usuario_id=usuario_id,
            status_id=status_inicial.id,
            categoria=dados.get("categoria", ""),
            categoria_rotulo=dados.get("categoria_rotulo", ""),
            descricao=dados.get("descricao", ""),
            endereco=dados.get("endereco", ""),
            latitude=self._para_float(dados.get("latitude")),
            longitude=self._para_float(dados.get("longitude")),
            volume=dados.get("volume"),
            data_ocorrencia=data_ocorrencia,
        )
        denuncia.historicos.append(
            HistoricoDenuncia(
                status_id=status_inicial.id,
                titulo="Denúncia recebida",
                descricao="Sua denúncia foi recebida com sucesso.",
            )
        )

        if self.armazenamento_fotos_service and arquivos_foto:
            caminhos = self.armazenamento_fotos_service.salvar_varios(
                arquivos_foto, protocolo
            )
            for caminho in caminhos:
                denuncia.fotos.append(FotoDenuncia(caminho_arquivo=caminho))

        self.denuncia_repository.salvar(denuncia)
        return denuncia

    def listar_denuncias_do_usuario(self, usuario_id):
        denuncias_ordenadas = (
            self.denuncia_repository.listar_por_usuario_mais_antigas_primeiro(usuario_id)
        )
        fila = FilaDenuncias()
        for denuncia in denuncias_ordenadas:
            fila.enfileirar(denuncia)
        return [self._serializar_resumo(d) for d in fila.listar_em_ordem()]

    def buscar_detalhe(self, protocolo, usuario_id):
        denuncia = self.denuncia_repository.buscar_por_protocolo(protocolo, usuario_id)
        if not denuncia:
            return None
        return self._serializar_detalhe(denuncia)

    def resumo_do_usuario(self, usuario_id):
        resumo = self.denuncia_repository.resumo_por_usuario(usuario_id)
        resumo["impacto_kg"] = resumo["total"] * 25
        return resumo

    def _serializar_resumo(self, denuncia):
        return {
            "protocolo": denuncia.protocolo,
            "assunto": denuncia.categoria_rotulo,
            "categoria": denuncia.categoria,
            "status": denuncia.status.codigo if denuncia.status else None,
            "status_rotulo": denuncia.status.rotulo if denuncia.status else None,
            "status_cor": denuncia.status.cor if denuncia.status else None,
            "data_envio": denuncia.criado_em.strftime("%d/%m/%Y"),
            "ultima_atualizacao": denuncia.atualizado_em.strftime("%d/%m/%Y"),
            "endereco": denuncia.endereco,
            "latitude": denuncia.latitude,
            "longitude": denuncia.longitude,
            "foto": denuncia.fotos[0].caminho_arquivo if denuncia.fotos else None,
        }

    def _serializar_detalhe(self, denuncia):
        resumo = self._serializar_resumo(denuncia)
        resumo.update(
            {
                "descricao": denuncia.descricao,
                "volume": ROTULOS_VOLUME.get(denuncia.volume, denuncia.volume),
                "data_ocorrencia": (
                    denuncia.data_ocorrencia.strftime("%d/%m/%Y")
                    if denuncia.data_ocorrencia
                    else None
                ),
                "fotos": [foto.caminho_arquivo for foto in denuncia.fotos],
                "historico": [
                    {
                        "titulo": h.titulo,
                        "descricao": h.descricao,
                        "data": h.criado_em.strftime("%d/%m/%Y"),
                        "hora": h.criado_em.strftime("%H:%M"),
                        "status": h.status.codigo if h.status else None,
                    }
                    for h in denuncia.historicos
                ],
            }
        )
        return resumo

    def _para_float(self, valor):
        try:
            return float(valor)
        except (TypeError, ValueError):
            return None
