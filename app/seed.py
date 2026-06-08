from app.extensions import database
from app.models.status_denuncia import StatusDenuncia
from app.models.usuario import Usuario

STATUS_PADRAO = [
    {"codigo": "recebida", "rotulo": "Recebida", "cor": "#7c3aed", "ordem": 1},
    {"codigo": "em_analise", "rotulo": "Em análise", "cor": "#0e7490", "ordem": 2},
    {"codigo": "em_andamento", "rotulo": "Em andamento", "cor": "#d97706", "ordem": 3},
    {"codigo": "concluida", "rotulo": "Concluída", "cor": "#15803d", "ordem": 4},
]

USUARIO_DEMO = {
    "nome": "João Silva",
    "email": "joao@ecotech.com",
    "senha": "ecotech123",
}

USUARIO_ADMIN = {
    "nome": "Equipe EcoTech",
    "email": "admin@ecotech.com",
    "senha": "admin123",
    "titulo": "Administrador",
}


def semear_status():
    for dados in STATUS_PADRAO:
        existente = database.session.execute(
            database.select(StatusDenuncia).filter_by(codigo=dados["codigo"])
        ).scalar_one_or_none()
        if not existente:
            database.session.add(StatusDenuncia(**dados))
    database.session.commit()


def semear_usuario_demo():
    existente = database.session.execute(
        database.select(Usuario).filter_by(email=USUARIO_DEMO["email"])
    ).scalar_one_or_none()
    if not existente:
        usuario = Usuario(nome=USUARIO_DEMO["nome"], email=USUARIO_DEMO["email"])
        usuario.definir_senha(USUARIO_DEMO["senha"])
        database.session.add(usuario)
        database.session.commit()


def semear_usuario_admin():
    existente = database.session.execute(
        database.select(Usuario).filter_by(email=USUARIO_ADMIN["email"])
    ).scalar_one_or_none()
    if not existente:
        usuario = Usuario(
            nome=USUARIO_ADMIN["nome"],
            email=USUARIO_ADMIN["email"],
            titulo=USUARIO_ADMIN["titulo"],
            is_admin=True,
        )
        usuario.definir_senha(USUARIO_ADMIN["senha"])
        database.session.add(usuario)
        database.session.commit()


def semear_dados_iniciais():
    semear_status()
    semear_usuario_demo()
    semear_usuario_admin()
