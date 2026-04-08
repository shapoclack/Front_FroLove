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
const timers = new Map();

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

app.post('/schedule', (req, res) => {
    const { endpoint, text, reminder, id } = req.body;
    const delay = reminder - Date.now();
    
    if (delay > 0) {
        const timerId = setTimeout(() => {
            const sub = subscriptions.find(s => s.endpoint === endpoint);
            if (sub) {
                const payload = {
                    title: 'Напоминание',
                    body: typeof text === 'string' ? text : 'Время пришло!',
                    actions: [{ action: 'snooze', title: 'Отложить на 5 минут' }],
                    data: { id, text, endpoint }
                };
                webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
                    console.error('Push Error:', err);
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
                    }
                });
            }
            timers.delete(id);
        }, delay);
        timers.set(id, timerId);
    }
    res.status(200).json({ status: 'scheduled' });
});

app.post('/snooze', (req, res) => {
    const { id, text, endpoint } = req.body;
    const delay = 5 * 60 * 1000; // 5 минут
    
    if (timers.has(id)) {
        clearTimeout(timers.get(id));
    }

    const timerId = setTimeout(() => {
        const sub = subscriptions.find(s => s.endpoint === endpoint);
        if (sub) {
            const payload = {
                title: 'Напоминание (повтор)',
                body: text,
                actions: [{ action: 'snooze', title: 'Отложить на 5 минут' }],
                data: { id, text, endpoint }
            };
            webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
                console.error('Push Error snooze:', err);
            });
        }
        timers.delete(id);
    }, delay);
    
    timers.set(id, timerId);
    res.status(200).json({ status: 'snoozed' });
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
