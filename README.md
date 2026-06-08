# 🌱 EcoTech — Plataforma de Denúncias de Descarte Irregular

Sistema web para que cidadãos de **Maringá-PR** registrem e acompanhem denúncias de descarte
irregular de resíduos. O projeto nasceu como um front-end estático e foi transformado em uma
aplicação completa, com autenticação, banco de dados, API e ambiente containerizado.

---

## 🎯 Objetivo

Permitir que qualquer pessoa:

- Crie uma conta e faça login com segurança.
- Registre denúncias em um fluxo guiado (localização no mapa → categoria → detalhes → revisão),
  anexando fotos.
- Acompanhe suas denúncias em uma tabela dinâmica, com protocolo, status e histórico.
- Visualize estatísticas pessoais e as denúncias plotadas em um mapa.

---

## 🧰 Tecnologias

| Camada | Tecnologia |
|---|---|
| Linguagem | Python 3.12 |
| Framework web | Flask (app factory) |
| ORM | SQLAlchemy + Flask-SQLAlchemy |
| Migrations | Flask-Migrate (Alembic) |
| Autenticação | Flask-Login + hash de senha (Werkzeug) |
| Banco de dados | PostgreSQL 16 |
| Servidor de aplicação | Gunicorn |
| Proxy reverso / arquivos estáticos | Nginx |
| Containers | Docker + Docker Compose |
| Front-end | HTML, CSS e JavaScript (Bootstrap 5, Bootstrap Icons, Leaflet) |
| Testes | pytest |

---

## 📁 Estrutura de pastas

```
aep2026/
├── app/
│   ├── __init__.py            # create_app(): factory da aplicação
│   ├── extensions.py          # instâncias de database, migrate, login_manager
│   ├── seed.py                # status padrão + usuário demo
│   ├── config/
│   │   └── settings.py        # configurações por ambiente
│   ├── models/                # Usuario, Denuncia, StatusDenuncia, HistoricoDenuncia, FotoDenuncia
│   ├── repositories/          # acesso ao banco (consultas)
│   ├── services/              # regras de negócio (auth, denúncias, upload de fotos)
│   ├── structures/            # TAD Fila FIFO (FilaDenuncias)
│   ├── routes/                # blueprints: páginas, autenticação, APIs
│   ├── templates/             # HTML (Jinja) — sem CSS/JS embutidos
│   └── static/
│       ├── css/               # main.css, dark-mode.css + 1 arquivo por página
│       ├── js/                # app.js (compartilhado) + 1 arquivo por página
│       └── imagens/           # imagens e uploads (volume)
├── migrations/                # Alembic
├── docker/                    # Dockerfile + entrypoint.sh
├── nginx/                     # default.conf (proxy reverso)
├── tests/                     # testes de unidade e de API
├── docker-compose.yml
├── wsgi.py                    # ponto de entrada do Gunicorn
├── requirements.txt
└── .env.example
```

---

## 🚀 Como rodar com Docker (recomendado)

Pré-requisitos: **Docker** e **Docker Compose**.

```bash
# 1. Clonar o repositório e entrar nele
git clone <url-do-repositorio>
cd aep2026

# 2. Criar o arquivo de variáveis de ambiente a partir do exemplo
cp .env.example .env      # no Windows: copy .env.example .env

# 3. Subir todo o ambiente (banco, aplicação e nginx)
docker compose up --build
```

A aplicação ficará disponível em **http://localhost:8081**.

O serviço de aplicação, ao subir, automaticamente:
1. aguarda o PostgreSQL ficar disponível;
2. aplica as migrations (`flask db upgrade`);
3. semeia os status padrão e um usuário demo (`flask seed`);
4. inicia o Gunicorn.

---

## 🔐 Variáveis de ambiente

Definidas no arquivo `.env` (veja `.env.example`):

| Variável | Descrição |
|---|---|
| `FLASK_ENV` | Ambiente: `development` ou `production` |
| `SECRET_KEY` | Chave secreta usada nas sessões (troque em produção) |
| `POSTGRES_USER` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL |
| `POSTGRES_DB` | Nome do banco |
| `DATABASE_URL` | URL de conexão SQLAlchemy (`postgresql+psycopg://...`) |
| `UPLOAD_DIR` | Diretório onde as fotos enviadas são salvas |

---

## 🗄️ Migrations

As migrations já vêm versionadas em `migrations/`. Para gerar uma nova após alterar os models:

```bash
docker compose exec web flask db migrate -m "descricao da mudanca"
docker compose exec web flask db upgrade
```

---

## 👤 Como acessar o sistema

Acesse **http://localhost:8081** e crie sua conta em **/registro**, ou use os usuários
criados automaticamente pelo seed:

- **Cidadão** — E-mail: `joao@ecotech.com` · Senha: `ecotech123`
- **Administrador** — E-mail: `admin@ecotech.com` · Senha: `admin123`

### URLs principais (sem `.html`)

| Página | URL |
|---|---|
| Login / Registro | `/login` · `/registro` |
| Início (dashboard) | `/inicio` |
| Nova denúncia (fluxo) | `/nova-denuncia` → `/nova-denuncia/categoria` → `/nova-denuncia/detalhes` → `/nova-denuncia/revisao` |
| Minhas denúncias | `/minhas-denuncias` |
| Painel pessoal | `/painel` |
| Educação ambiental | `/educacao-ambiental` |
| Locais de coleta | `/locais-de-coleta` |
| Perfil / Configurações | `/perfil` · `/configuracoes` |
| **Painel administrativo** | `/admin` · `/admin/denuncias` · `/admin/usuarios` (só para admins) |

O Nginx redireciona automaticamente URLs antigas terminadas em `.html` para a versão limpa.

---

## 🧱 Regra obrigatória: TAD Fila (FIFO) em "Minhas Denúncias"

A aba **Minhas Denúncias** é alimentada por uma **estrutura de Fila (TAD)** com comportamento
**FIFO** (First In, First Out), implementada em
[`app/structures/fila_denuncias.py`](app/structures/fila_denuncias.py).

A classe **`FilaDenuncias`** expõe os métodos:

- `enfileirar(denuncia)` — adiciona ao fim da fila;
- `desenfileirar()` — remove e retorna o primeiro elemento;
- `primeiro()` — consulta o primeiro sem remover;
- `esta_vazia()` — indica se a fila está vazia;
- `tamanho()` — quantidade de elementos;
- `listar_em_ordem()` — retorna os elementos na ordem de entrada.

**Como é usada no fluxo:** em
[`app/services/denuncia_service.py`](app/services/denuncia_service.py), o método
`listar_denuncias_do_usuario` busca as denúncias do banco da **mais antiga para a mais recente**,
**enfileira** cada uma na `FilaDenuncias` e devolve `listar_em_ordem()`. Assim, as denúncias mais
antigas são listadas/processadas antes das mais recentes — a garantia da ordem FIFO vem da
estrutura de dados, e não apenas de um `ORDER BY`. Essa ordem alimenta a API
`GET /api/denuncias`, consumida pela tabela dinâmica do front-end.

---

## 🛠️ Painel administrativo

A **equipe** (usuários com `is_admin = true`) tem acesso a uma área restrita em `/admin`,
protegida pelo decorator `admin_required`
([`app/routes/seguranca.py`](app/routes/seguranca.py)). O acesso é controlado pelo campo
booleano `is_admin` na tabela `usuarios` (migration `0002`); o seed já cria um administrador
(`admin@ecotech.com`).

O painel permite:

- **Dashboard** (`/admin`) — estatísticas globais (total de denúncias, ativas, concluídas,
  usuários) e distribuição por status.
- **Denúncias** (`/admin/denuncias`) — lista **todas** as denúncias de **todos** os usuários,
  com busca e filtro por status. Ao abrir o detalhe (denunciante, fotos, histórico), o admin
  pode **alterar o status**, o que gera automaticamente um novo registro no histórico.
- **Usuários** (`/admin/usuarios`) — lista os usuários e permite **promover/rebaixar**
  administradores (um admin não pode remover o próprio acesso).

O link **"Painel admin"** aparece na barra lateral apenas para usuários administradores.

---

## 🔌 API

Todas as rotas exigem usuário autenticado.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/denuncias` | Lista as denúncias do usuário em ordem FIFO |
| `POST` | `/api/denuncias` | Cria uma denúncia (multipart, com fotos) |
| `GET` | `/api/denuncias/<protocolo>` | Detalhe de uma denúncia (com histórico e fotos) |
| `GET` | `/api/estatisticas` | Totais do usuário (total, ativas, concluídas, impacto) |

### API administrativa (exige `is_admin`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/denuncias` | Lista todas as denúncias (mais recentes primeiro) |
| `GET` | `/api/admin/denuncias/<protocolo>` | Detalhe completo (com denunciante) |
| `POST` | `/api/admin/denuncias/<protocolo>/status` | Atualiza o status (registra no histórico) |
| `GET` | `/api/admin/status` | Lista os status disponíveis |
| `GET` | `/api/admin/estatisticas` | Estatísticas globais da plataforma |
| `GET` | `/api/admin/usuarios` | Lista os usuários |
| `POST` | `/api/admin/usuarios/<id>/admin` | Promove/rebaixa um administrador |

---

## 🧪 Comandos úteis

```bash
# Subir o ambiente
docker compose up --build

# Subir em segundo plano
docker compose up -d --build

# Ver logs da aplicação
docker compose logs -f web

# Rodar os testes
docker compose exec web pytest

# Acessar o shell do container da aplicação
docker compose exec web sh

# Acessar o banco
docker compose exec db psql -U ecotech -d ecotech

# Derrubar tudo (mantém os volumes)
docker compose down

# Derrubar e apagar os dados
docker compose down -v
```

---

## 🔭 Possíveis melhorias futuras

- Página de detalhe completa da denúncia (timeline e galeria de fotos).
- Notificações reais (e-mail / push) a cada mudança de status.
- Paginação e ordenação configurável na tabela de denúncias.
- Testes de front-end (E2E) e cobertura ampliada do backend.
- Cache e otimização das consultas de estatísticas.

---

Feito com 💚 para uma Maringá mais limpa e sustentável.
