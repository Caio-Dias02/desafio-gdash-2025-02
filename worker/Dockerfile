# Stage 1: Build
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum
COPY go.mod go.sum ./

# Download dependências
RUN go mod download

# Copiar código-fonte
COPY *.go ./

# Build (compilar)
RUN CGO_ENABLED=0 GOOS=linux go build -o weather-worker .

# Stage 2: Runtime (imagem mínima)
FROM alpine:latest

WORKDIR /app

# Copiar o binário compilado
COPY --from=builder /app/weather-worker .

# Copiar .env (ou .env.example)
COPY .env.example .env

# Comando padrão: rodar o worker
CMD ["./weather-worker"]
