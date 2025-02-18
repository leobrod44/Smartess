ping rabbitmq
if [ $? -ne 0 ]; then
  echo "RabbitMQ is not running"
  exit 1
fi

nc -zv rabbitmq 5672
if [ $? -ne 0 ]; then
  echo "RabbitMQ is not listening on port 5672"
  exit 1
fi

docker exec -it rabbitmq netstat -tlnp | grep 5552
if [ $? -ne 0 ]; then
  echo "RabbitMQ is not listening on port 5552 for MQ Streams"
  exit 1
fi
docker exec -it rabbitmq rabbitmq-diagnostics listeners
if [ $? -ne 0 ]; then
  echo "RabbitMQ Ports listeners, sockets,etc... failed to display"
  exit 1
fi
docker exec -it rabbitmq rabbitmq-plugins list
if [ $? -ne 0 ]; then
  echo "RabbitMQ plugins list failed to display"
  exit 1
fi