import pytest

from app.structures.fila_denuncias import FilaDenuncias, FilaVaziaError


def test_fila_comeca_vazia():
    fila = FilaDenuncias()
    assert fila.esta_vazia() is True
    assert fila.tamanho() == 0


def test_enfileirar_e_listar_em_ordem_fifo():
    fila = FilaDenuncias()
    fila.enfileirar("antiga")
    fila.enfileirar("intermediaria")
    fila.enfileirar("recente")
    assert fila.listar_em_ordem() == ["antiga", "intermediaria", "recente"]


def test_desenfileirar_respeita_fifo():
    fila = FilaDenuncias()
    fila.enfileirar("primeira")
    fila.enfileirar("segunda")
    assert fila.desenfileirar() == "primeira"
    assert fila.primeiro() == "segunda"
    assert fila.tamanho() == 1


def test_desenfileirar_fila_vazia_lanca_erro():
    fila = FilaDenuncias()
    with pytest.raises(FilaVaziaError):
        fila.desenfileirar()


def test_primeiro_fila_vazia_lanca_erro():
    fila = FilaDenuncias()
    with pytest.raises(FilaVaziaError):
        fila.primeiro()
