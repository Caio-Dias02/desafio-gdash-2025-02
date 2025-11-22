package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	amqp "github.com/rabbitmq/amqp091-go"
)

// WeatherData representa os dados climáticos
type WeatherData struct {
	City       string  `json:"city"`
	Temperature float64 `json:"temperature"`
	Humidity   int     `json:"humidity"`
	WindSpeed  float64 `json:"windSpeed"`
	Condition  string  `json:"condition"`
	RainChance int     `json:"rainChance"`
	Pressure   int     `json:"pressure"`
	Visibility int     `json:"visibility"`
	Timestamp  string  `json:"timestamp"`
}

// Consumer gerencia a lógica de consumo da fila
type Consumer struct {
	conn       *amqp.Connection
	channel    *amqp.Channel
	queueName  string
	apiURL     string
	maxRetries int
}

// NewConsumer cria um novo consumer
func NewConsumer(rabbitMQURL string, apiURL string) *Consumer {
	return &Consumer{
		queueName:  "weather-queue",
		apiURL:     apiURL,
		maxRetries: 3,
	}
}

// Connect conecta ao RabbitMQ
func (c *Consumer) Connect(rabbitMQURL string) error {
	fmt.Println("[INFO] Conectando ao RabbitMQ...")

	// 1. Conectar ao RabbitMQ
	conn, err := amqp.Dial(rabbitMQURL)
	if err != nil {
		fmt.Printf("[ERROR] Erro ao conectar: %v\n", err)
		return err
	}
	c.conn = conn

	// 2. Abrir channel
	ch, err := conn.Channel()
	if err != nil {
		fmt.Printf("[ERROR] Erro ao abrir channel: %v\n", err)
		return err
	}
	c.channel = ch

	// 3. Declarar fila (cria se não existir)
	_, err = ch.QueueDeclare(
		c.queueName,
		true,  // durable
		false, // autoDelete
		false, // exclusive
		false, // noWait
		nil,   // args
	)
	if err != nil {
		fmt.Printf("[ERROR] Erro ao declarar fila: %v\n", err)
		return err
	}

	fmt.Printf("[OK] Conectado! Consumindo fila '%s'\n", c.queueName)
	return nil
}

// Start inicia o consumo de mensagens
func (c *Consumer) Start() error {
	fmt.Println("[INFO] Iniciando consumer...")

	// 1. Configurar QoS (quantas mensagens processar por vez)
	err := c.channel.Qos(1, 0, false)
	if err != nil {
		fmt.Printf("[ERROR] Erro ao configurar QoS: %v\n", err)
		return err
	}

	// 2. Registrar consumer
	messages, err := c.channel.Consume(
		c.queueName,
		"",    // consumer name
		false, // autoAck (vamos confirmar manualmente)
		false, // exclusive
		false, // noLocal
		false, // noWait
		nil,   // args
	)
	if err != nil {
		fmt.Printf("[ERROR] Erro ao registrar consumer: %v\n", err)
		return err
	}

	fmt.Println("[OK] Aguardando mensagens...")

	// 3. Processar mensagens continuamente
	for message := range messages {
		fmt.Printf("\n[RECEIVED] Nova mensagem recebida\n")

		// Parsear JSON
		var weatherData WeatherData
		err := json.Unmarshal(message.Body, &weatherData)
		if err != nil {
			fmt.Printf("[ERROR] Erro ao fazer parse JSON: %v\n", err)
			// Nack (rejeita sem reinsert)
			message.Nack(false, false)
			continue
		}

		fmt.Printf("   Cidade: %s\n", weatherData.City)
		fmt.Printf("   Temperatura: %.2fC\n", weatherData.Temperature)
		fmt.Printf("   Umidade: %d%%\n", weatherData.Humidity)

		// Enviar pra API NestJS
		success := c.sendToAPI(weatherData)

		if success {
			// Ack: confirma que processou com sucesso
			fmt.Println("[OK] Mensagem confirmada")
			message.Ack(false)
		} else {
			// Nack: rejeita e reinsere na fila
			fmt.Println("[WARN] Mensagem rejeitada (reinsere na fila)")
			message.Nack(false, true)
		}
	}

	return nil
}

// sendToAPI envia dados pra API NestJS
func (c *Consumer) sendToAPI(data WeatherData) bool {
	fmt.Printf("[SEND] POST %s\n", c.apiURL)

	// 1. Converter struct para JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Printf("[ERROR] Erro ao fazer marshal JSON: %v\n", err)
		return false
	}

	// 2. Fazer requisição POST
	resp, err := http.Post(
		c.apiURL,
		"application/json",
		strings.NewReader(string(jsonData)),
	)
	if err != nil {
		fmt.Printf("[ERROR] Erro ao fazer POST: %v\n", err)
		return false
	}
	defer resp.Body.Close()

	// 3. Ler resposta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("[ERROR] Erro ao ler resposta: %v\n", err)
		return false
	}

	// 4. Verificar status code
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		fmt.Printf("[OK] Dados enviados com sucesso (HTTP %d)\n", resp.StatusCode)
		return true
	} else {
		fmt.Printf("[ERROR] Erro HTTP %d: %s\n", resp.StatusCode, string(body))
		return false
	}
}

// Close fecha a conexão
func (c *Consumer) Close() {
	if c.channel != nil {
		c.channel.Close()
	}
	if c.conn != nil {
		c.conn.Close()
	}
	fmt.Println("[INFO] Desconectado do RabbitMQ")
}
