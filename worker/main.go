package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Carregar .env
	_ = godotenv.Load()

	rabbitMQURL := os.Getenv("RABBITMQ_URL")
	if rabbitMQURL == "" {
		rabbitMQURL = "amqp://guest:guest@localhost:5672/"
	}

	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:3001/api/weather/logs"
	}

	fmt.Println("==================================================")
	fmt.Println("[*] Weather Data Worker (Go)")
	fmt.Println("==================================================")
	fmt.Printf("RabbitMQ: %s\n", rabbitMQURL)
	fmt.Printf("API URL: %s\n", apiURL)
	fmt.Println("==================================================")

	// 2. Criar consumer
	consumer := NewConsumer(rabbitMQURL, apiURL)

	// 3. Conectar ao RabbitMQ
	err := consumer.Connect(rabbitMQURL)
	if err != nil {
		fmt.Println("[ERROR] Nao conseguiu conectar ao RabbitMQ")
		fmt.Println("        Verifique se RabbitMQ esta rodando (docker-compose up)")
		return
	}

	// 4. Iniciar consumidor em goroutine
	go func() {
		err := consumer.Start()
		if err != nil {
			fmt.Printf("[ERROR] Erro ao iniciar consumer: %v\n", err)
		}
	}()

	// 5. Aguardar sinais de encerramento (CTRL+C)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan

	fmt.Println("\n\n[INFO] Encerrando worker...")
	consumer.Close()
	fmt.Println("[OK] Fechado com sucesso")
}
