import amqplib from 'amqplib';

export const MAIN_QUEUE = 'main_tasks';
export const DLX_EXCHANGE = 'tasks_dlx';
export const DLQ = 'tasks_dead_letter';

export async function setupRabbitMQ() {
  const connection = await amqplib.connect('amqp://localhost');
  const channel = await connection.createChannel();

  // 1. Создаём Dead Letter Exchange
  await channel.assertExchange(DLX_EXCHANGE, 'direct', { durable: true });

  // 2. Создаём Dead Letter Queue
  await channel.assertQueue(DLQ, { durable: true });

  // 3. Привязываем DLQ к DLX
  await channel.bindQueue(DLQ, DLX_EXCHANGE, 'dead');

  // 4. Создаём основную очередь с указанием DLX
  await channel.assertQueue(MAIN_QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': DLX_EXCHANGE,
      'x-dead-letter-routing-key': 'dead',
    },
  });

  console.log('RabbitMQ configured: main_tasks -> [DLX] -> tasks_dead_letter');
  return { connection, channel };
}
