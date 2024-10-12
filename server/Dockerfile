# Stage 1: Build the Go binary
FROM golang:1.23.2-alpine AS builder
WORKDIR /app

COPY ../go.mod ../go.sum ./

RUN go mod download

COPY . .

RUN go build -o main

# Stage 2: Run the Go app
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
