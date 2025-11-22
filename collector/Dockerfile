# Usar imagem Python official
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements.txt
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código do collector
COPY main.py .
COPY weather_client.py .
COPY queue_producer.py .

# Copiar .env (cria um padrão se não existir)
COPY .env.example .env

# Comando padrão: rodar o collector
CMD ["python", "main.py"]
