require('dotenv').config();

const app = require('./app');
const port = process.env.PORT || 3001;

const RabbitMQService = require('./rabbitmq-consumers/defaultConsumer.js'); 
const rabbitMQService = new RabbitMQService();

async function startRabbitMQService() {
  try {
    await rabbitMQService.init();
    await rabbitMQService.setupExchangesAndQueues();
    await rabbitMQService.startConsuming();
    console.log('RabbitMQ Service started successfully');
  } catch (err) {
    console.error('Failed to start RabbitMQ Service', err);
  }
}

startRabbitMQService();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
