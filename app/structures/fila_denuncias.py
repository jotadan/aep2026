from collections import deque


class FilaVaziaError(Exception):
    pass


class FilaDenuncias:
    def __init__(self):
        self._itens = deque()

    def enfileirar(self, denuncia):
        self._itens.append(denuncia)

    def desenfileirar(self):
        if self.esta_vazia():
            raise FilaVaziaError("A fila de denúncias está vazia.")
        return self._itens.popleft()

    def primeiro(self):
        if self.esta_vazia():
            raise FilaVaziaError("A fila de denúncias está vazia.")
        return self._itens[0]

    def esta_vazia(self):
        return len(self._itens) == 0

    def tamanho(self):
        return len(self._itens)

    def listar_em_ordem(self):
        return list(self._itens)
