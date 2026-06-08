#!/bin/sh
set -e

python - <<'PY'
import os
import time
import psycopg

url = os.environ.get("DATABASE_URL", "").replace("+psycopg", "")
for tentativa in range(30):
    try:
        psycopg.connect(url).close()
        print("Banco de dados disponível.")
        break
    except Exception as erro:
        print(f"Aguardando o banco de dados... ({erro})")
        time.sleep(2)
else:
    raise SystemExit("Banco de dados indisponível após várias tentativas.")
PY

flask db upgrade
flask seed

exec gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 wsgi:app
