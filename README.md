# Front_FroLove

Репозиторий с практическими заданиями по курсу «Фронтенд и бэкенд разработка».

## Структура проекта

```
Front_FroLove/
├── task1/          # Задание 1 — Вёрстка страницы магазина
├── task2/          # Задание 2 — CRUD-интерфейс (клиентский)
├── task3/          # Задание 3 — Работа с DevTools и HTTP
├── task4/          # Задание 4–5 — REST API + React-клиент
│   ├── client/     # React + Vite (фронтенд)
│   └── server/     # Express (бэкенд)
├── task7/          # Задание 7 — Node.js
├── task8/          # Задание 8 — JWT-авторизация
├── task9/          # Задание 9 — Refresh-токены
├── task10/         # Задание 10 — React-клиент + Axios Interceptors
│   ├── client/     # React + Vite (фронтенд)
│   └── server/     # Express (бэкенд)
└── README.md
```

## Практическое задание 1 — Вёрстка страницы магазина

Статическая страница «Магазин курсов по разработке» с карточками курсов.

**Технологии:** HTML, SCSS/CSS, БЭМ  
**Файлы:** `task1/index.html`, `task1/product.html`

---

## Практическое задание 2 — CRUD-интерфейс (клиентский)

Страница управления товарами с операциями создания, чтения, обновления и удаления на чистом JavaScript (данные хранятся в памяти браузера).

**Технологии:** HTML, JavaScript, SCSS/CSS  
**Файлы:** `task2/index.html`, `task2/js/products.js`

---

## Практическое задание 3 — Работа с DevTools и HTTP

Отчёты с результатами исследования HTTP-запросов и инструментов разработчика браузера.

**Файлы:** `task3/reports1/`, `task3/reports2/`

---

## Практическое задание 4 — REST API сервер

Express-сервер с CRUD-операциями для сущностей **Product** и **User**, хранение данных в памяти.

### API эндпоинты

| Метод    | URL                  | Описание                   |
|----------|----------------------|----------------------------|
| `GET`    | `/api/products`      | Список всех продуктов      |
| `POST`   | `/api/products`      | Создать продукт            |
| `GET`    | `/api/products/:id`  | Получить продукт по ID     |
| `PATCH`  | `/api/products/:id`  | Обновить продукт           |
| `DELETE` | `/api/products/:id`  | Удалить продукт            |
| `GET`    | `/api/users`         | Список всех пользователей  |
| `POST`   | `/api/users`         | Создать пользователя       |
| `GET`    | `/api/users/:id`     | Получить пользователя по ID|
| `PATCH`  | `/api/users/:id`     | Обновить пользователя      |
| `DELETE` | `/api/users/:id`     | Удалить пользователя       |

### Swagger-документация

Интерактивная документация доступна по адресу `/api-docs` (swagger-jsdoc + swagger-ui-express).

**Технологии:** Node.js, Express, nanoid, cors, swagger-jsdoc, swagger-ui-express

---

## Практическое задание 5 — React-клиент

SPA-приложение на React + Vite, подключённое к REST API из задания 4. Реализован список продуктов с возможностью добавления, редактирования и удаления через модальное окно.

**Технологии:** React, Vite, Axios, SCSS

---

## Практическое задание 7 — Node.js

Серверное приложение на Node.js.

**Технологии:** Node.js, Express

---

## Практическое задание 8 — JWT-авторизация

Express-сервер с JWT-авторизацией: регистрация, логин, защищённые маршруты для CRUD товаров, Swagger-документация.

**Технологии:** Node.js, Express, jsonwebtoken, bcrypt, swagger-jsdoc

---

## Практическое задание 9 — Refresh-токены

Расширение задания 8 — добавлена система access/refresh-токенов с ротацией.

- **Access-токен** — срок жизни 15 минут, используется для авторизации запросов
- **Refresh-токен** — срок жизни 7 дней, используется для получения новой пары токенов
- `POST /api/auth/refresh` — ротация: старый refresh-токен удаляется, выдаётся новая пара
- `POST /api/auth/logout` — серверная инвалидация refresh-токена
- Фронтенд с автоматическим обновлением токенов и кнопкой ручной ротации

**Технологии:** Node.js, Express, jsonwebtoken, bcrypt

### Запуск

```bash
cd task9
npm install
npm start
```

Сервер: `http://localhost:3001`

---

## Практическое задание 10 — React-клиент с Axios Interceptors

Полноценное React SPA-приложение, подключённое к серверу из задания 9. Реализованы:

- **Авторизация** — регистрация, логин, автоматический refresh токенов
- **Axios Interceptors** — request (инъекция Bearer-токена) и response (авто-обновление при 401)
- **CRUD товаров** — список, создание, просмотр, редактирование, удаление
- **React Router** — приватные и гостевые маршруты
- **Тёмная тема** — glassmorphism, анимации

**Технологии:** React 19, Vite, Axios, react-router-dom, Node.js, Express

### Запуск

```bash
# Терминал 1 — Бэкенд
cd task10/server
npm install
node app.js
# → http://localhost:3001

# Терминал 2 — Фронтенд
cd task10/client
npm install
npm run dev
# → http://localhost:5173
```

---

## Запуск ранних заданий

### Сервер (task4/server)

```bash
cd task4/server
npm install
node app.js
```

Сервер запустится на `http://localhost:3000`.  
Swagger UI: `http://localhost:3000/api-docs`

### Клиент (task4/client)

```bash
cd task4/client
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`.

## Автор

**FroLove Kirill**
