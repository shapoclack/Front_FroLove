const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const port = process.env.PORT || 8016;

const publicVapidKey = 'BCYcj53z0Osid1xFOFgkAZ4LLigrNR-zPvWtWAVnRtPsJ24QX0qxFHQO59JC0GUr8Qi0mcbY0ppP5kFsle4anE4';
const privateVapidKey = 'heXZr9x27KZm3pKrAp61ks99CXlqhCdCNc_6A0nIQfE';

webpush.setVapidDetails(
    'mailto:admin@example.com',
    publicVapidKey,
    privateVapidKey
);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let subscriptions = [];

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log('User subscribed to Push');
    res.status(201).json({});
});

app.post('/unsubscribe', (req, res) => {
    const subscriptionEndpoint = req.body.endpoint;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== subscriptionEndpoint);
    console.log('User unsubscribed from Push');
    res.status(200).json({});
});

const sendPushNotification = (payload) => {
    subscriptions.forEach((subscription, index) => {
        webpush.sendNotification(subscription, JSON.stringify(payload)).catch(err => {
            console.error('Push Error:', err);
            if (err.statusCode === 404 || err.statusCode === 410) {
                subscriptions.splice(index, 1);
            }
        });
    });
};

io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('newTask', (taskText) => {
        console.log('New task from client:', taskText);
        socket.broadcast.emit('taskAdded', taskText);
        
        // Отправка Push
        const payload = {
            title: 'Новая заметка',
            body: `Кто-то добавил заметку: "${taskText}"`
        };
        sendPushNotification(payload);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
