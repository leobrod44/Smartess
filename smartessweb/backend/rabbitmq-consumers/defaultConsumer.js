const amqp = require('amqplib');
const supabase = require('../config/supabase');

class RabbitMQService {
  constructor() {
    this.channel = null;
    this.connection = null;
    // for now only alerts, later can use other queues
    // won't use all queues in queues.yaml, so no need to get queues from file. Can hardcode
    this.queues = [
      { name: 'videostream', routingKey: 'videostream.hubid.*' },
      //{ name: 'alerts', routingKey: '#.alerts.*' },
    ];
  }

  async init() {
    try {
      let config = {
        protocol: 'amqp',
        hostname: 'rabbitmq',
        port: 5672,
        username: 'admin',
        password: 'admin',
        locale: 'en_US',
        frameMax: 0,
        heartbeat: 0,
        vhost: '/',
      };

      this.connection = await this.createConnection(config);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ from Smartess backend');
    } catch (err) {
      console.error('Failed to initialize RabbitMQ from Smartess backend', err);
      throw err;
    }
  }

  async createConnection(config) {
    const conn = await amqp.connect(config);

    conn.on("error", function(err) {
        console.error("Connection error to RabbitMQ from Smartess backend:",err.message);
    });

    conn.on("close", function() {
        console.error("Connection closed to RabbitMQ from Smartess backend:", err.message);
    });

    return conn;
  }

  async setupExchangesAndQueues() {
    try {
      //TODO: set specific exchange for each queue
      await this.channel.assertExchange('videostream', 'topic', { durable: true });

      for (const queue of this.queues) {
        await this.channel.assertQueue(queue.name, { durable: true });
        await this.channel.bindQueue(queue.name, 'videostream', queue.routingKey);
        console.log(`Queue ${queue.name} bound to exchange with routing key: ${queue.routingKey}`);
      }

      console.log('Exchanges and queues set up successfully');
    } catch (err) {
      console.error('Failed to set up/assert exchanges and queues', err);
      throw err;
    }
  }

  async startConsuming() {
    for (const queue of this.queues) {
      this.channel.consume(queue.name, async (msg) => {
        if (msg !== null) {
          console.log(`Received message from ${queue.name}: ${msg.content.toString()}`);
          await this.handleMessage(queue.name, msg);
          this.channel.ack(msg);
        }
      });
    }

    console.log('Started consuming messages');
  }

  async handleMessage(queue, msg) {
    // can add handling for other type of messages here
    switch (queue) {
      case 'alerts':
        //Publish to supabase
        const log = JSON.parse(msg.content.toString());

        //will consume alerts in the page directly, logging to supabase now done from the server on alert handling
        //leaving js code here for later frontend use
        break;
      case "videostream":
      const videoSegment = msg.content;
      console.log('handling video stream message:', videoSegment);
      //TO DO: use video data on website
      default:
        console.warn(`No handler found for queue: ${queue}`);
    }
  }

  async close() {
    await this.channel.close();
    await this.connection.close();
    console.log('Closed RabbitMQ connections');
  }
}

module.exports = RabbitMQService;