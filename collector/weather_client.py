import requests
import os
from datetime import datetime

class WeatherClient:
    """Cliente para buscar dados de clima do OpenWeather API"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    def get_weather(self, city: str) -> dict:
        """
        Busca dados de clima para uma cidade

        Args:
            city: Nome da cidade (ex: "Cordeirópolis")

        Returns:
            dict com temperatura, umidade, vento, etc.

        Exemplo:
            {
                "city": "Cordeirópolis",
                "temperature": 28.5,
                "humidity": 65,
                "windSpeed": 12.3,
                "condition": "Clouds",
                "rainChance": 20,
                "pressure": 1013,
                "visibility": 10000,
                "timestamp": "2025-11-21T14:30:00Z"
            }
        """

        try:
            # 1. Fazer requisição GET pra OpenWeather
            params = {
                'q': city,
                'appid': self.api_key,
                'units': 'metric'  # Celsius, não Fahrenheit
            }
            response = requests.get(self.base_url, params=params)

            # 2. Verificar se a requisição foi bem-sucedida
            if response.status_code != 200:
                print(f"[ERROR] Erro OpenWeather: {response.status_code}")
                print(f"Response: {response.text}")
                return None

            # 3. Parsear resposta JSON
            data = response.json()

            # 4. Extrair campos relevantes
            weather_data = {
                'city': data['name'],
                'temperature': data['main']['temp'],           # °C
                'humidity': data['main']['humidity'],          # %
                'windSpeed': data['wind']['speed'],            # m/s
                'condition': data['weather'][0]['main'],       # "Clouds", "Sunny", etc
                'rainChance': data.get('clouds', {}).get('all', 0),  # % de nuvens
                'pressure': data['main']['pressure'],          # hPa
                'visibility': data.get('visibility', 0),       # metros
                'timestamp': datetime.utcnow().isoformat() + 'Z'  # ISO 8601
            }

            print(f"[OK] Dados coletados de {weather_data['city']}")
            print(f"   Temperatura: {weather_data['temperature']}C")
            print(f"   Umidade: {weather_data['humidity']}%")

            return weather_data

        except requests.exceptions.ConnectionError:
            print("[ERROR] Nao conseguiu conectar a OpenWeather API")
            return None
        except requests.exceptions.Timeout:
            print("[ERROR] Timeout na requisicao OpenWeather")
            return None
        except KeyError as e:
            print(f"[ERROR] Campo esperado nao encontrado na resposta: {e}")
            return None
        except Exception as e:
            print(f"[ERROR] Erro inesperado: {e}")
            return None
