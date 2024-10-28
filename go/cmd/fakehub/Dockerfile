FROM golang:1.19-alpine

WORKDIR /app

COPY main.go .

RUN go mod init fakehub && go mod tidy

RUN go build -o fakehub .

EXPOSE 8080

CMD ["./fakehub"]