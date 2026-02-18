const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

const app = express();
const port = 3000;

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

// GET /api/products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// GET /api/products/:id
app.get("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

// POST /api/products
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

// PATCH /api/products/:id
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

// DELETE /api/products/:id
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
});
