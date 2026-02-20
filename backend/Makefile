# Variáveis para facilitar a manutenção
APP = app.main:app
HOST = 127.0.0.1
PORT = 8000

# .PHONY diz ao make que isso são comandos, não arquivos reais
.PHONY: run install migrate upgrade docker-up clean

# --- Comandos do Servidor ---

# Inicia o servidor em modo de desenvolvimento
run:
	uvicorn $(APP) --host $(HOST) --port $(PORT) --reload

# Inicia o servidor em modo "produção" (sem reload)
start:
	uvicorn $(APP) --host $(HOST) --port $(PORT)

# --- Comandos do Banco de Dados (Alembic) ---

# Cria uma nova migration (uso: make migrate msg="nome da migration")
migrate:
	alembic revision --autogenerate -m "$(msg)"

# Aplica as atualizações no banco de dados
upgrade:
	alembic upgrade head

# Desfaz a última migration
downgrade:
	alembic downgrade -1

# --- Instalação e Limpeza ---

# Instala as dependências (ajuste se usar poetry ou pipenv)
install:
	pip install -r requirements.txt

# Limpa arquivos de cache do Python (__pycache__, .pyc, etc)
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# --- Docker (Opcional) ---
docker-up:
	docker-compose up -d --build