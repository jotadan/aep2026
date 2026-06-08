def _criar_denuncia(client, categoria="plasticos", rotulo="Plásticos", endereco="Av. Brasil, 1"):
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


def test_admin_bloqueia_usuario_comum(cliente_logado):
    resposta = cliente_logado.get("/api/admin/denuncias")
    assert resposta.status_code == 403


def test_admin_bloqueia_anonimo(client):
    resposta = client.get("/api/admin/denuncias")
    assert resposta.status_code == 401


def test_admin_lista_denuncias_de_todos(cliente_logado, client, cliente_admin):
    _criar_denuncia(cliente_logado, endereco="Endereço do usuário comum")

    resposta = cliente_admin.get("/api/admin/denuncias")
    assert resposta.status_code == 200
    denuncias = resposta.get_json()
    assert len(denuncias) == 1
    assert denuncias[0]["endereco"] == "Endereço do usuário comum"
    assert denuncias[0]["denunciante"] == "Usuário Teste"


def test_admin_atualiza_status_registra_historico(cliente_logado, cliente_admin):
    criacao = _criar_denuncia(cliente_logado)
    protocolo = criacao.get_json()["protocolo"]

    resposta = cliente_admin.post(
        f"/api/admin/denuncias/{protocolo}/status",
        json={"status": "em_andamento", "observacao": "Equipe a caminho."},
    )
    assert resposta.status_code == 200
    dados = resposta.get_json()
    assert dados["status"] == "em_andamento"
    titulos = [h["titulo"] for h in dados["historico"]]
    assert any("Em andamento" in t for t in titulos)


def test_admin_status_invalido_retorna_400(cliente_logado, cliente_admin):
    protocolo = _criar_denuncia(cliente_logado).get_json()["protocolo"]
    resposta = cliente_admin.post(
        f"/api/admin/denuncias/{protocolo}/status", json={"status": "inexistente"}
    )
    assert resposta.status_code == 400


def test_admin_estatisticas_globais(cliente_logado, cliente_admin):
    _criar_denuncia(cliente_logado)
    resposta = cliente_admin.get("/api/admin/estatisticas")
    dados = resposta.get_json()
    assert dados["total"] == 1
    assert dados["total_usuarios"] == 2
    assert dados["por_status"]["recebida"] == 1


def test_admin_promove_usuario(cliente_admin, app):
    from app.extensions import database
    from app.models.usuario import Usuario

    with app.app_context():
        comum = database.session.execute(
            database.select(Usuario).filter_by(email="teste@ecotech.com")
        ).scalar_one()
        comum_id = comum.id

    resposta = cliente_admin.post(
        f"/api/admin/usuarios/{comum_id}/admin", json={"is_admin": True}
    )
    assert resposta.status_code == 200
    assert resposta.get_json()["is_admin"] is True


def test_admin_nao_remove_proprio_acesso(cliente_admin, app):
    from app.extensions import database
    from app.models.usuario import Usuario

    with app.app_context():
        admin = database.session.execute(
            database.select(Usuario).filter_by(email="admin@ecotech.com")
        ).scalar_one()
        admin_id = admin.id

    resposta = cliente_admin.post(
        f"/api/admin/usuarios/{admin_id}/admin", json={"is_admin": False}
    )
    assert resposta.status_code == 400
