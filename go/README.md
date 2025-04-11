# Hub and Core System
Go codebase
## Hub Team Features Demo Video link

[Video for Presentation Day Hub Team Demo](https://drive.google.com/file/d/1KnHlDSw1Z77iP68RljKhooetPIYsfUyf/view?usp=sharing) 
<br/>

## Hub Developer Getting Started Guide

1. If you do not already have the smartess_network set up on docker, in the main directory "Smartess" run:

    ```bash
      docker network create smartess_network
    ```
   
2. In the "Smartess" directory, run:

    ```bash
      docker-compose up
    ```

3. Go to the directory:

    ``` Smartess\go\mock_mongo_server```

4. Run:

    ```bash
      docker-compose up
    ```

5. Go to the directory:

    ``` Smartess\go\hub```

6. Run:

    ```bash
      docker-compose up
    ```

# Go Backend (Hub and Server): Codebase design and structure description

_The go/ folder is the backend of the Smartess project. It is the core of the system, handling the IoT events on hardware and networks, and microservices needed into processing and using them_

> Doc & ref infra+standards+research wikis: Antoine (notify for major edits/removals/additions, just to keep everyone in hub team in-line) &nbsp;
 
> Collaborators of go/: &nbsp; Leo, Ryan, Antoine,Renaud 

## cmd/ 
Main entry points for drivers/executables of core services

### cmd/hub/
- The hub is the smart devices gateway.
- It is the core IoT controller of the system.
- It is the core RabbitMQ Publisher in our system design.
- Architecturally, it is directly related to the HA daemon and any other IoT configs/networking related directly to handling the smart devices. 
it will play the role of data aggregator and will transform HA / raw Smartess IoT events into asynchronous RabbitMQ messages / events
 
### cmd/server/
- The (backend Smartess) server is the backend processor.
- It is the core IoT-event model of the system.
- It holds the core RabbitMQ Consumers; themselves built into microservices / managers.
- Architecturally, it is the orchestrator between various data managers before they reach the frontend/views API of the website/app.
- It arbors microservices that handle the layered-architecture's business logic equivalents more or less; e.g. alerts, notifications, system updates, requests/responses middleware between view and device controllers

## common/
Shared resources and utilities for hub and server
### common/configs
why: configurations, metadata, general structure, field, templates, layouts \
how: yaml,json,bson, etc... files for Marshalling, Serializing, Templating. \
what: for: queues, exchanges, bindings, message-layout, namespaces, test-configs
### common/logging
Utilities and Impl Commonly used for: \
logging, log levels & vars, debugging & tracing,profiling... Impl-specific logging 

### common/rabbitmq
RabbitMQInstance ( \
       RabbitMQConfig ( QueueConfigs (queue attributes/params), ExchangeConfigs (exchange attributes/params)) \
       Connection (physical network),  \
       Channel (concurrent virtual conns, for now only one... eventually many for distributed system) ) \
Methods to: Marshall into configStructs from yaml-config , then from configstructs to an rabbitmqInstance.
    
### common/structures
Common data structures, Entities, Contexts, States, EntityFormats structs \
Also lot of HA specific structs and interfaces, as well as relevant enums for go codebase \

## hub/
Any scripts, configs, utilities specifically related to the Hub service \
   .Local configs and hub specific rules sets \
   .Home Assistant related gateways/utilities, parsing of IoT events.. \
   .hub specific logger \
   . SmartessHub/RabbitMQHub (RabbitMQInstance, websocket/webhook conn, hub_logger) Init() Start() \
   . RabbitMQ Publishers and publisher-side exchanges \
   . WebSocket... hub app ports, hub IP; Networking, phys con, virtual chans, hosts, RabbitMQ Dialer \
   . Different Connection setups and webhooks: production or dev Hub is RPI/HA, dev or test Hub is mockups \
   . [Open to scale] Token, Authentification, security, data/connection integrity, 

   . Hardware installation scripts and docs \
   . RTSP video streaming feature (core networking and logic) \
   . Unified event system (General handling of RPI hub side IoT events/alerts) \
   . Home assistant Hub daemon logic, configs, utils, etc... \

## server/
Any scripts, configs, utilities specifically related to the Backend service \
  .RabbitMQServer (RabbitMQInstance, logger, consumers, exchanges, bindings) Init() and Start() \
  .RabbitMQ Consumers and Consumer-side Exchanges setup \
  . [Open to scale] Microservices and Managers \
  . [Open to scale] Model & Orchestrator logic to manage and containerize microservices \
  . Data,Persistence, Managers and Business logic to service frontend-apis/views \

# Dependencies and Design from Wikis
For Go, RabbitMQ, Docker, and other dependencies, see the Architecture wiki and Infrastructure and Tools wikis. \
For smart cameras real time streaming feature specifically, see the research notes wiki. \
For the QA and CI pipeline of go codebase, see Code standards wiki and name convention. \
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
|   +---mock camera
|   |
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
|   |       config.yaml (Previously or eventually again: queues.yaml + exchanges.yaml)
|   |       
|   |
|   +---logging
|   |       logging.go
|   |
|   +---rabbitmq
|   |       ....
|   |       queues.go
|   |       exchanges.go
|   |       rabbitmq.go
|   +---scripts
|   |
|   \---structures
|           structures.go
|           enums.go
|
+---hub
|   |   hub_daemon.go  (Formerly hub.go, Main producer driver)
|   |
|   +---config
|   |       config.yaml
|   |        ....
|   +---ha
|   |       ha.go
|   |       ....
|   |
|   +---events (General handling of RPI hub side IoT events/alerts; Now Unified even system)
|   |
|   |
|   +---installation (Hub Hardwares installation doc and scripts)
|   |
|   +---rtsp (New Video streaming feature; core networking, processing logic for hub app+transport-layer)
|   |
|   |
|   \---logger
|           logger.go
|
\---server
  +--- README.md
  |
  \--- rabbitmq
     \--handlers/ (Consumer handlers and middlewars before website/smartess APIs: Events, alerts, logging, Video controller/muxer/segmenter)
     \--static/ (Server side version of pages for scripts and to see alerts or video only)
       |
        rabbitmq.go (main consumer driver)
        ....
  ....
```
