const express = require('express');
const path = require('path');
const { nanoid } = require("nanoid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'public')));
const JWT_SECRET = "very_secret_key_123";
const JWT_EXPIRES_IN = '1h';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API AUTH WITH JWT',
            version: '1.0.0',
            description: 'API для изучения JWT авторизации (Задание №8)',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./app.js'],
};

let users = [];
let products = [];

// Вспомогательные функции
function findUserOr404(email, res) {
    const user = users.find(u => u.email == email);
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}

function findProductOr404(id, res) {
    const product = products.find(p => p.id === id);
    if (!product) {
        res.status(404).json({ error: "product not found" });
        return null;
    }
    return product;
}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            console.log('Body:', req.body);
        }
    });
    next();
});

// ==================== AUTH ====================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, password]
 *             properties:
 *               email: { type: string, example: ivan@mail.ru }
 *               first_name: { type: string, example: Иван }
 *               last_name: { type: string, example: Иванов }
 *               password: { type: string, example: qwerty123 }
 */
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "missing fields" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
        id: nanoid(6),
        email,
        first_name,
        last_name,
        hashedPassword
    };

    users.push(newUser);
    const { hashedPassword: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя (выдача JWT)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: ivan@mail.ru }
 *               password: { type: string, example: qwerty123 }
 *     responses:
 *       200:
 *         description: Успешный вход, возвращает токен
 */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "missing fields" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({ login: true, token });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация об авторизованном пользователе
 */
app.get("/api/auth/me", authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { hashedPassword, ...safeUser } = user;
    res.json(safeUser);
});

// ==================== PRODUCTS ====================

app.get("/api/products", (req, res) => {
    res.json(products);
});

app.post("/api/products", (req, res) => {
    const { title, category, description, price } = req.body;
    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: "missing fields" });
    }
    const newProduct = { id: nanoid(6), title, category, description, price };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id (Защищено JWT)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 */
app.get("/api/products/:id", authenticateToken, (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар (Защищено JWT)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 */
app.put("/api/products/:id", authenticateToken, (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { title, category, description, price } = req.body;
    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (Защищено JWT)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 */
app.delete("/api/products/:id", authenticateToken, (req, res) => {
    const id = req.params.id;
    const initialLength = products.length;
    products = products.filter(p => p.id !== id);
    if (products.length === initialLength) {
        return res.status(404).json({ error: "product not found" });
    }
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
