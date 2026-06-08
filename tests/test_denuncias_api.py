def _criar_denuncia(client, categoria, rotulo, endereco):
    return client.post(
        "/api/denuncias",
        data={
            "categoria": categoria,
            "categoria_rotulo": rotulo,
            "descricao": "Descarte irregular relatado.",
            "endereco": endereco,
            "latitude": "-23.4273",
            "longitude": "-51.9375",
            "volume": "medio",
            "data_ocorrencia": "2025-05-20",
        },
    )


def test_listar_sem_login_redireciona(client):
    resposta = client.get("/api/denuncias")
    assert resposta.status_code in (302, 401)


def test_criar_denuncia_retorna_protocolo(cliente_logado):
    resposta = _criar_denuncia(
        cliente_logado, "plasticos", "Plásticos", "Av. Colombo, 1000"
    )
    assert resposta.status_code == 201
    assert resposta.get_json()["protocolo"].startswith("ECO-")


def test_listagem_respeita_ordem_fifo(cliente_logado):
    _criar_denuncia(cliente_logado, "plasticos", "Plásticos", "Endereço antigo")
    _criar_denuncia(cliente_logado, "eletronicos", "Eletrônicos", "Endereço recente")

    resposta = cliente_logado.get("/api/denuncias")
    assert resposta.status_code == 200
    denuncias = resposta.get_json()
    assert len(denuncias) == 2
    assert denuncias[0]["endereco"] == "Endereço antigo"
    assert denuncias[0]["protocolo"] < denuncias[1]["protocolo"]


def test_estatisticas_refletem_denuncias(cliente_logado):
    _criar_denuncia(cliente_logado, "plasticos", "Plásticos", "Rua A")
    resposta = cliente_logado.get("/api/estatisticas")
    dados = resposta.get_json()
    assert dados["total"] == 1
    assert dados["ativas"] == 1
    assert dados["concluidas"] == 0
