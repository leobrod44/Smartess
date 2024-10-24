1. start the rabbitmq server:

brew services start rabbitmq

2. You can monitor the server on 

http://localhost:15672/#/


To get hub id: 
- docker ps to get port
- docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 1f4fe65e8fe5