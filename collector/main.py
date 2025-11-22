#!/usr/bin/env python3
"""
Weather Data Collector

Coleta dados de clima de OpenWeather e publica em RabbitMQ periodicamente.

Uso:
    python main.py

Requisitos:
    - .env configurado com OPENWEATHER_API_KEY e RABBITMQ_URL
    - RabbitMQ rodando em localhost:5672
    - OpenWeather API acessível
"""

import os
import schedule
import time
from dotenv import load_dotenv

from weather_client import WeatherClient
from queue_producer import QueueProducer


def main():
    """Função principal"""

    # 1. Carregar variáveis de .env
    load_dotenv()

    api_key = os.getenv('OPENWEATHER_API_KEY')
    rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')
    city = os.getenv('WEATHER_CITY', 'Cordeirópolis')
    interval = int(os.getenv('COLLECTION_INTERVAL', 3600))  # 1 hora por padrão

    # 2. Validar configuração
    if not api_key:
        print("[ERROR] OPENWEATHER_API_KEY nao configurado no .env")
        return

    print("=" * 50)
    print("[*] Weather Data Collector")
    print("=" * 50)
    print(f"Cidade: {city}")
    print(f"Intervalo: {interval}s ({interval // 60} min)")
    print(f"RabbitMQ: {rabbitmq_url}")
    print("=" * 50)

    # 3. Inicializar cliente
    weather_client = WeatherClient(api_key)
    producer = QueueProducer(rabbitmq_url)

    # 4. Conectar ao RabbitMQ
    if not producer.connect():
        print("[ERROR] Abortando...")
        return

    # 5. Função que será executada periodicamente
    def collect_and_publish():
        """Coleta dados e publica na fila"""
        print(f"\n[COLLECT] Coleta iniciada em {time.strftime('%Y-%m-%d %H:%M:%S')}")

        # Buscar dados
        weather_data = weather_client.get_weather(city)

        if weather_data:
            # Publicar na fila
            producer.publish(weather_data)
        else:
            print("[WARN] Nao conseguiu coletar dados")

    # 6. Agendar coleta periódica
    schedule.every(interval).seconds.do(collect_and_publish)

    # 7. Fazer coleta imediata (não espera interval para primeira)
    print("\n[INIT] Executando coleta inicial...")
    collect_and_publish()

    # 8. Loop principal (roda para sempre)
    print("\n[INFO] Aguardando proxima coleta...")
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)  # Verifica a cada segundo se é hora de coletar
    except KeyboardInterrupt:
        print("\n\n[INFO] Encerrando collector...")
        producer.close()
        print("[OK] Fechado com sucesso")


if __name__ == '__main__':
    main()
