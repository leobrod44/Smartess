# Codebase design and structure description

_The go/ folder is the backend of the Smartess project. It is the core of the system, handling the IoT events on hardware and networks, and microservices needed into processing and using them_

> Doc & ref infra+arch wikis: Antoine (notify for major edits) &nbsp; [as of state of main branch on **2024-11-07** (may or may not be subject to changes in future)]
 
> Collaborators of go/: &nbsp; Leo, Ryan, Antoine,Renaud 


# Dependencies and Design from Wikis
For Go, RabbitMQ, Docker, and other dependencies, see the Architecture wiki and Infrastructure and Tools wikis. \
Docker-composes and Dockerfiles should be commented and clear enough to understand the dependencies (Grafana, Loki,Promtail,etc...) and the build process as of Release 1. 


# Directory structure overview 
> NB: This includes generally important hidden/gitignored files. Also: '...' indicates that there could be more files (currently or in future)
```
|   go.mod
|   go.sum
|   envs...
|   [docker compose is on project root]
|   README.md
|
+---cmd
|   +---hub
|   |   |   docker-compose.yml
|   |   |   Dockerfile
|   |   |   main.go
|   |   |
|   |   \---logs
|   |           server.log
|   |           ....
|   |
|   +---mockhub
|   |       Dockerfile
|   |       main.go
|   |
|   +---mock_mongo_server
|   |   |   docker-compose.yml
|   |   |   Dockerfile
|   |   |   main.go
|   |   |
|   |   \---logs
|   |           server.log
|   |           ....
|   \---server
|       |   Dockerfile
|       |   main.go
|       |
|       \---logs
|               server.log
|                ....   
+---common
|   +---configs
|   |       queues.yaml
|   |
|   +---logging
|   |       logging.go
|   |
|   +---rabbitmq
|   |       ....
|   |       queues.go
|   |       exchanges.go
|   |       rabbitmq.go
|   |
|   |
|   \---structures
|           structures.go
|          ....
|
+---hub
|   |   hub.go
|   |
|   +---config
|   |       config.yaml
|   |        ....
|   +---ha
|   |       ha.go
|   |       ....
|   |
|   \---logger
|           logger.go
|
\---server
  +--- README.md
  |
  \--- rabbitmq
        consumer.go
        rabbitmq.go
        ....
  ....
```
