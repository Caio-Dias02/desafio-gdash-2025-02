import pika
import json
import time

class QueueProducer:
    """Produtor de mensagens para RabbitMQ"""

    def __init__(self, rabbitmq_url: str):
        self.rabbitmq_url = rabbitmq_url
        self.connection = None
        self.channel = None
        self.queue_name = 'weather-queue'

    def connect(self) -> bool:
        """
        Conecta ao RabbitMQ

        Returns:
            True se conectou com sucesso, False caso contrário
        """
        try:
            print("[INFO] Conectando ao RabbitMQ...")

            # 1. Criar credenciais
            credentials = pika.PlainCredentials('guest', 'guest')

            # 2. Criar connection parameters
            params = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                credentials=credentials,
                connection_attempts=3,
                retry_delay=2
            )

            # 3. Conectar
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()

            # 4. Declarar fila (cria se não existir)
            self.channel.queue_declare(
                queue=self.queue_name,
                durable=True  # Fila sobrevive se RabbitMQ reiniciar
            )

            print(f"[OK] Conectado! Fila '{self.queue_name}' pronta")
            return True

        except pika.exceptions.AMQPConnectionError:
            print("[ERROR] Nao conseguiu conectar ao RabbitMQ")
            print("   Verifique se RabbitMQ esta rodando (docker-compose up)")
            return False
        except Exception as e:
            print(f"[ERROR] Erro ao conectar: {e}")
            return False

    def publish(self, weather_data: dict) -> bool:
        """
        Publica dados de clima na fila

        Args:
            weather_data: Dicionário com dados climáticos

        Returns:
            True se publicou com sucesso, False caso contrário
        """
        try:
            if not self.connection or self.connection.is_closed:
                print("❌ Não está conectado. Conectando...")
                if not self.connect():
                    return False

            # 1. Converter dicionário para JSON
            message = json.dumps(weather_data, ensure_ascii=False)

            # 2. Publicar na fila
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
                )
            )

            print(f"[SENT] Mensagem publicada em '{self.queue_name}'")
            print(f"   Cidade: {weather_data['city']}")
            print(f"   Temperatura: {weather_data['temperature']}C")
            return True

        except Exception as e:
            print(f"[ERROR] Erro ao publicar: {e}")
            return False

    def close(self):
        """Fecha conexao com RabbitMQ"""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            print("[INFO] Desconectado do RabbitMQ")
