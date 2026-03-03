const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 3000;

// ─── Swagger configuration ─────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shop & Users API",
      version: "1.0.0",
      description: "CRUD API для пользователей и продуктов",
    },
    servers: [{ url: `http://localhost:${port}` }],
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // адрес фронтенда
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`
    );
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      console.log("Body:", req.body);
    }
  });
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Имя пользователя
 *           example: "Иван Иванов"
 *         email:
 *           type: string
 *           description: Электронная почта
 *           example: "ivan@example.com"
 *         age:
 *           type: integer
 *           description: Возраст пользователя
 *           example: 25
 */

let users = [
  { id: nanoid(6), name: "Иван Иванов", email: "ivan@example.com", age: 25 },
  { id: nanoid(6), name: "Мария Петрова", email: "maria@example.com", age: 30 },
  { id: nanoid(6), name: "Алексей Сидоров", email: "alex@example.com", age: 22 },
];

function findUserOr404(id, res) {
  const user = users.find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }
  return user;
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Массив пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get("/api/users", (req, res) => {
  res.json(users);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 */
app.get("/api/users/:id", (req, res) => {
  const user = findUserOr404(req.params.id, res);
  if (!user) return;
  res.json(user);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новый пользователь"
 *               email:
 *                 type: string
 *                 example: "new@example.com"
 *               age:
 *                 type: integer
 *                 example: 28
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Не указаны обязательные поля
 */
app.post("/api/users", (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Missing required fields: name, email" });
  }

  const newUser = {
    id: nanoid(6),
    name: String(name).trim(),
    email: String(email).trim(),
    age: age !== undefined ? Number(age) : null,
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Обновить данные пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Обновлённое имя"
 *               email:
 *                 type: string
 *                 example: "updated@example.com"
 *               age:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       200:
 *         description: Пользователь обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Пользователь не найден
 */
app.patch("/api/users/:id", (req, res) => {
  const user = findUserOr404(req.params.id, res);
  if (!user) return;

  if (
    req.body?.name === undefined &&
    req.body?.email === undefined &&
    req.body?.age === undefined
  ) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, email, age } = req.body;

  if (name !== undefined) user.name = String(name).trim();
  if (email !== undefined) user.email = String(email).trim();
  if (age !== undefined) user.age = Number(age);

  res.json(user);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       204:
 *         description: Пользователь удалён
 *       404:
 *         description: Пользователь не найден
 */
app.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const before = users.length;
  users = users.filter((u) => u.id !== id);
  if (users.length === before) {
    return res.status(404).json({ error: "User not found" });
  }
  res.status(204).send();
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор продукта
 *           example: "xyz789"
 *         name:
 *           type: string
 *           example: "Игровая мышь Logitech G102"
 *         category:
 *           type: string
 *           example: "Периферия"
 *         description:
 *           type: string
 *           example: "Игровая мышь с подсветкой RGB"
 *         price:
 *           type: number
 *           example: 1990
 *         stock:
 *           type: integer
 *           example: 25
 *         rating:
 *           type: number
 *           example: 4.8
 *         image:
 *           type: string
 *           example: ""
 */

let products = [
  {
    id: nanoid(6),
    name: "Игровая мышь Logitech G102",
    category: "Периферия",
    description: "Игровая мышь с подсветкой RGB, 8000 DPI",
    price: 1990,
    stock: 25,
    rating: 4.8,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Клавиатура HyperX Alloy",
    category: "Периферия",
    description: "Механическая клавиатура с подсветкой",
    price: 6990,
    stock: 10,
    rating: 4.7,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Монитор AOC 24\"",
    category: "Мониторы",
    description: "24-дюймовый монитор 144 Гц",
    price: 15990,
    stock: 8,
    rating: 4.6,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Наушники Razer Kraken",
    category: "Аудио",
    description: "Игровая гарнитура с микрофоном",
    price: 5990,
    stock: 15,
    rating: 4.5,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Кресло DXRacer",
    category: "Мебель",
    description: "Игровое кресло с поддержкой поясницы",
    price: 21990,
    stock: 5,
    rating: 4.9,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Коврик для мыши SteelSeries",
    category: "Периферия",
    description: "Большой коврик для мыши",
    price: 1490,
    stock: 30,
    rating: 4.4,
    image: ""
  },
  {
    id: nanoid(6),
    name: "SSD Samsung 1TB",
    category: "Накопители",
    description: "Твердотельный накопитель 1 ТБ",
    price: 8990,
    stock: 12,
    rating: 4.9,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Видеокарта RTX 3060",
    category: "Видеокарты",
    description: "Игровая видеокарта 12 ГБ",
    price: 34990,
    stock: 4,
    rating: 4.7,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Процессор Ryzen 5 5600X",
    category: "Процессоры",
    description: "6 ядер, 12 потоков, до 4.6 ГГц",
    price: 17990,
    stock: 7,
    rating: 4.8,
    image: ""
  },
  {
    id: nanoid(6),
    name: "Оперативная память 16 ГБ",
    category: "Память",
    description: "DDR4 3200 МГц, 2x8 ГБ",
    price: 4990,
    stock: 18,
    rating: 4.6,
    image: ""
  }
];

function findProductOr404(id, res) {
  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех продуктов
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Массив продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 */
app.get("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый продукт
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новый продукт"
 *               category:
 *                 type: string
 *                 example: "Категория"
 *               description:
 *                 type: string
 *                 example: "Описание продукта"
 *               price:
 *                 type: number
 *                 example: 999
 *               stock:
 *                 type: integer
 *                 example: 10
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               image:
 *                 type: string
 *                 example: ""
 *     responses:
 *       201:
 *         description: Продукт создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Не указаны обязательные поля
 */
app.post("/api/products", (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;

  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: nanoid(6),
    name: String(name).trim(),
    category: String(category).trim(),
    description: String(description).trim(),
    price: Number(price),
    stock: Number(stock),
    rating: rating !== undefined ? Number(rating) : null,
    image: image ? String(image).trim() : ""
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить данные продукта
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Продукт обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Продукт не найден
 */
app.patch("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  if (
    req.body?.name === undefined &&
    req.body?.category === undefined &&
    req.body?.description === undefined &&
    req.body?.price === undefined &&
    req.body?.stock === undefined &&
    req.body?.rating === undefined &&
    req.body?.image === undefined
  ) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { name, category, description, price, stock, rating, image } = req.body;

  if (name !== undefined) product.name = String(name).trim();
  if (category !== undefined) product.category = String(category).trim();
  if (description !== undefined) product.description = String(description).trim();
  if (price !== undefined) product.price = Number(price);
  if (stock !== undefined) product.stock = Number(stock);
  if (rating !== undefined) product.rating = Number(rating);
  if (image !== undefined) product.image = String(image).trim();

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить продукт
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID продукта
 *     responses:
 *       204:
 *         description: Продукт удалён
 *       404:
 *         description: Продукт не найден
 */
app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id;
  const before = products.length;
  products = products.filter((p) => p.id !== id);
  if (products.length === before) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
