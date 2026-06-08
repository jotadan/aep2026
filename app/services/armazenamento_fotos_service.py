import os
import secrets

from werkzeug.utils import secure_filename


class ArmazenamentoFotosService:
    def __init__(self, diretorio_upload, extensoes_permitidas):
        self.diretorio_upload = diretorio_upload
        self.extensoes_permitidas = extensoes_permitidas

    def _extensao_valida(self, nome_arquivo):
        if "." not in nome_arquivo:
            return False
        extensao = nome_arquivo.rsplit(".", 1)[1].lower()
        return extensao in self.extensoes_permitidas

    def salvar(self, arquivo, protocolo):
        if not arquivo or not arquivo.filename or not self._extensao_valida(arquivo.filename):
            return None
        os.makedirs(self.diretorio_upload, exist_ok=True)
        extensao = arquivo.filename.rsplit(".", 1)[1].lower()
        nome_unico = f"{protocolo}_{secrets.token_hex(8)}.{extensao}"
        nome_seguro = secure_filename(nome_unico)
        caminho_absoluto = os.path.join(self.diretorio_upload, nome_seguro)
        arquivo.save(caminho_absoluto)
        return f"uploads/{nome_seguro}"

    def salvar_varios(self, arquivos, protocolo):
        caminhos = []
        for arquivo in arquivos:
            caminho = self.salvar(arquivo, protocolo)
            if caminho:
                caminhos.append(caminho)
        return caminhos
