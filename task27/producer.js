import express from 'express';
import { setupRabbitMQ, MAIN_QUEUE } from './setup.js';

const app = express();
app.use(express.json());

let channel;

// Инициализация RabbitMQ при старте
async function init() {
  try {
    const setup = await setupRabbitMQ();
    channel = setup.channel;
    console.log('Producer linked to RabbitMQ');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err.message);
    process.exit(1);
  }
}

app.post('/tasks', async (req, res) => {
  const { type, payload } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: 'Missing type or payload' });
  }

  const task = {
    id: Date.now().toString(),
    type,
    payload,
    timestamp: new Date().toISOString()
  };

  channel.sendToQueue(
    MAIN_QUEUE,
    Buffer.from(JSON.stringify(task)),
    { persistent: true }
  );

  console.log(`[Producer] Task sent: ${task.id}`);
  res.status(202).json({ message: 'Task accepted', taskId: task.id });
});

const PORT = 3000;
app.listen(PORT, async () => {
  await init();
  console.log(`Producer API running on http://localhost:${PORT}`);
});
