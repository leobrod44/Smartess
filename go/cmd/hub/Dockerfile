# Use the official Go image
FROM golang:1.23.2-alpine AS builder
WORKDIR /app

# Copy go.mod and go.sum files from the parent directory
COPY ../../go.mod ../../go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the entire application code from the current directory (cmd/hub)
COPY . .

# Build the Go app
RUN go build -o main ./cmd/hub/main.go

# Use a smaller image for the final stage
FROM alpine:latest

# Install netcat (nc) in the final image
RUN apk add --no-cache netcat-openbsd

WORKDIR /root/
COPY --from=builder /app/main .

# Command to run the executable
CMD ["./main"]
