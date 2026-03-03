# Front_FroLove

Репозиторий с практическими заданиями по курсу «Фронтенд и бэкенд разработка».

## Структура проекта

```
Front_FroLove/
├── task1/          # Практическое задание 1
├── task2/          # Практическое задание 2
├── task3/          # Практическое задание 3
├── task4/          # Практическое задание 4–5
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

## Запуск проекта

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
