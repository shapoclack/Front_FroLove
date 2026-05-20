import { setupRabbitMQ, MAIN_QUEUE } from './setup.js';

const MAX_RETRIES = 3;
const WORKER_ID = process.env.WORKER_ID || '1';

async function processTask(task) {
  console.log(`[Worker ${WORKER_ID}] Processing task: ${task.id} (${task.type})`);
  
  // Имитация работы
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Имитация случайной ошибки для проверки Retry и DLQ
  // Если в payload есть field "forceError": true, будем кидать ошибку
  if (task.payload?.forceError) {
    throw new Error('Simulated processing failure');
  }

  console.log(`[Worker ${WORKER_ID}] Task ${task.id} completed successfully`);
}

async function startWorker() {
  const { channel } = await setupRabbitMQ();

  channel.prefetch(1); // Каждый воркер берёт по одной задаче
  console.log(`[Worker ${WORKER_ID}] Waiting for tasks in "${MAIN_QUEUE}"...`);

  channel.consume(MAIN_QUEUE, async (msg) => {
    if (!msg) return;

    const task = JSON.parse(msg.content.toString());
    const retryCount = (msg.properties.headers?.['x-retry-count'] || 0);

    console.log(`[Worker ${WORKER_ID}] Received task ${task.id}. Attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);

    try {
      await processTask(task);
      channel.ack(msg);
    } catch (err) {
      console.error(`[Worker ${WORKER_ID}] Error: ${err.message}`);

      if (retryCount < MAX_RETRIES) {
        // Логика Retry: перепубликация в ту же очередь с задержкой и инкрементом счётчика
        const delay = 1000 * Math.pow(2, retryCount); // Экспоненциальная задержка
        console.warn(`[Worker ${WORKER_ID}] Retrying task ${task.id} in ${delay}ms...`);
        
        // Отклоняем старое сообщение (удаляем из очереди)
        channel.nack(msg, false, false);

        // Ждем задержку перед переотправкой (упрощенно, в реале лучше использовать отдельную delay queue)
        setTimeout(() => {
          channel.sendToQueue(MAIN_QUEUE, msg.content, {
            persistent: true,
            headers: { 'x-retry-count': retryCount + 1 }
          });
        }, delay);
        
      } else {
        // Исчерпали попытки -> в DLQ
        console.error(`[Worker ${WORKER_ID}] Task ${task.id} failed after ${MAX_RETRIES + 1} attempts. Sending to DLQ.`);
        // nack с requeue=false отправит сообщение в DLX (так как мы настроили его в arguments очереди)
        channel.nack(msg, false, false);
      }
    }
  });
}

startWorker().catch(err => {
  console.error('Worker failed to start:', err.message);
  process.exit(1);
});
