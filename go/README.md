# Codebase design and structure description

_The go/ folder is the backend of the Smartess project. It is the core of the system, handling the IoT events on hardware and networks, and microservices needed into processing and using them_

> Doc & ref infra+arch wikis: Antoine (notify for major edits) &nbsp; [as of state of main branch on **2024-11-07** (may or may not be subject to changes in future)]
 
> Collaborators of go/: &nbsp; Leo, Ryan, Antoine,Renaud 

## cmd/ 
Main entry points for drivers/executables of core services

## cmd/hub/
- The hub is the smart devices gateway.
- It is the core IoT controller of the system.
- It is the core RabbitMQ Publisher in our system design.
- Architecturally, it is directly related to the HA daemon and any other IoT configs/networking related directly to handling the smart devices. 
it will play the role of data aggregator and will transform HA / raw Smartess IoT events into asynchronous RabbitMQ messages / events
 
## cmd/server/
- The (backend Smartess) server is the backend processor.
- It is the core IoT-event model of the system.
- It holds the core RabbitMQ Consumers; themselves built into microservices / managers.
- Architecturally, it is the orchestrator between various data managers before they reach the frontend/views API of the website/app.
- It arbors microservices that handle the layered-architecture's business logic equivalents more or less; e.g. alerts, notifications, system updates, requests/responses middleware between view and device controllers


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
