const express = require('express');
const cors = require('cors');
const { nanoid } = require("nanoid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

// ==================== Конфигурация токенов ====================
const ACCESS_SECRET = "access_secret";
const REFRESH_SECRET = "refresh_secret";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// ==================== Роли ====================
const ROLES = {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
};

// ==================== Хранилище ====================
let users = [];
let products = [];
const refreshTokens = new Set();

// ==================== Middleware ====================
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179'],
    credentials: true
}));
app.use(express.json());

// Логирование
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    });
    next();
});

// ==================== Вспомогательные функции ====================
async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

function generateTokens(payload) {
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
}

// Middleware аутентификации
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    jwt.verify(token, ACCESS_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

// Middleware авторизации по ролям
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: "Access denied: role not found" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied: insufficient permissions" });
        }
        next();
    };
};

// ==================== AUTH ====================

// Регистрация
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "missing fields" });
    }

    if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: "user already exists" });
    }

    // Проверка допустимой роли
    const validRoles = [ROLES.USER, ROLES.SELLER, ROLES.ADMIN];
    const userRole = validRoles.includes(role) ? role : ROLES.USER;

    const hashedPassword = await hashPassword(password);
    const newUser = {
        id: nanoid(6),
        email,
        first_name,
        last_name,
        hashedPassword,
        role: userRole,
        blocked: false
    };
    users.push(newUser);

    const { hashedPassword: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
});

// Логин
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "missing fields" });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    if (user.blocked) {
        return res.status(403).json({ error: "user is blocked" });
    }

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: "invalid credentials" });
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const tokens = generateTokens(payload);
    refreshTokens.add(tokens.refreshToken);

    res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    });
});

// Обновление токенов
app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken is required" });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(403).json({ error: "Refresh token is not in the allowed list" });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
        if (err) {
            refreshTokens.delete(refreshToken);
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        refreshTokens.delete(refreshToken);

        const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
        const newTokens = generateTokens(payload);
        refreshTokens.add(newTokens.refreshToken);

        res.status(200).json({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        });
    });
});

// Выход
app.post("/api/auth/logout", (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) refreshTokens.delete(refreshToken);
    res.status(200).json({ message: "Logged out successfully" });
});

// Текущий пользователь
app.get("/api/auth/me", authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { hashedPassword, ...safeUser } = user;
    res.json(safeUser);
});

// ==================== USERS (только admin) ====================

// Список пользователей
app.get("/api/users", authenticateToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
    const safeUsers = users.map(({ hashedPassword, ...u }) => u);
    res.json(safeUsers);
});

// Пользователь по ID
app.get("/api/users/:id", authenticateToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "user not found" });

    const { hashedPassword, ...safeUser } = user;
    res.json(safeUser);
});

// Обновление пользователя
app.put("/api/users/:id", authenticateToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "user not found" });

    const { first_name, last_name, email, role } = req.body;
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email;
    if (role !== undefined && [ROLES.USER, ROLES.SELLER, ROLES.ADMIN].includes(role)) {
        user.role = role;
    }

    const { hashedPassword, ...safeUser } = user;
    res.json(safeUser);
});

// Блокировка пользователя (soft delete)
app.delete("/api/users/:id", authenticateToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "user not found" });

    if (user.id === req.user.id) {
        return res.status(400).json({ error: "cannot block yourself" });
    }

    user.blocked = !user.blocked;

    const { hashedPassword, ...safeUser } = user;
    res.json({ message: user.blocked ? "User blocked" : "User unblocked", user: safeUser });
});

// ==================== PRODUCTS ====================

// Все товары (user, seller, admin)
app.get("/api/products", authenticateToken, (req, res) => {
    res.json(products);
});

// Создание товара (seller, admin)
app.post("/api/products", authenticateToken, authorizeRoles(ROLES.SELLER, ROLES.ADMIN), (req, res) => {
    const { title, category, description, price } = req.body;
    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: "missing fields" });
    }
    const newProduct = { id: nanoid(6), title, category, description, price: Number(price) };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Товар по ID (user, seller, admin)
app.get("/api/products/:id", authenticateToken, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "product not found" });
    res.json(product);
});

// Обновление товара (seller, admin)
app.put("/api/products/:id", authenticateToken, authorizeRoles(ROLES.SELLER, ROLES.ADMIN), (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "product not found" });

    const { title, category, description, price } = req.body;
    if (title !== undefined) product.title = title;
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);

    res.json(product);
});

// Удаление товара (только admin)
app.delete("/api/products/:id", authenticateToken, authorizeRoles(ROLES.ADMIN), (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "product not found" });
    products.splice(idx, 1);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
