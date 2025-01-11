const amqp = require('amqplib');
const supabase = require('../config/supabase');

class RabbitMQService {
  constructor() {
    this.channel = null;
    this.connection = null;
    // for now only alerts, later can use other queues
    // won't use all queues in queues.yaml, so no need to get queues from file. Can hardcode
    this.queues = [
      { name: 'alerts', routingKey: '#.alerts.*' },
    ];
  }

  async init() {
    try {
      let config = {
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        username: 'admin',
        password: 'admin',
        locale: 'en_US',
        frameMax: 0,
        heartbeat: 0,
        vhost: '/',
      };

      this.connection = await createConnection(config);
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
      await this.channel.assertExchange('smartess_topic_exchange', 'topic', { durable: true });

      for (const queue of this.queues) {
        await this.channel.assertQueue(queue.name, { durable: true });
        await this.channel.bindQueue(queue.name, 'test_topic_exchange', queue.routingKey);
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
          console.log(`Received message from ${queue}: ${msg.content.toString()}`);
          await this.handleMessage(queue, msg);
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
        const { data, error } = await supabase
          .from('alerts')
          .insert([
            { 
              type: 'default', 
              active: 'FALSE', 
              created_at: log.time_fired.toString(), 
              device_id: log.device.toString(), 
              message: log.message.toString(), 
              description: log.state.toString(), 
              hub_ip: log.hub_ip.toString() 
            }
          ]);

        if (error) {
          console.error('Error inserting alert into supabase:', error);
        } else {
          console.log('Alert inserted successfully in supabase:', data);
        }

        //notify frontend? seems like frontend already polling supabase on load see hubController.js line 62
        //should notify frontend on alert, not only on reload
        break;
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