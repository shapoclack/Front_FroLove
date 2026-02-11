// "База данных" товаров в памяти 
let products = [
  { id: 1, name: "Телефон", price: 19990 },
  { id: 2, name: "Ноутбук", price: 59990 },
  { id: 3, name: "Наушники", price: 4990 }
];

// Получаем элементы формы
const idInput = document.getElementById("product-id");
const nameInput = document.getElementById("product-name");
const priceInput = document.getElementById("product-price");
const listEl = document.getElementById("products-list");

// Кнопки
const createBtn = document.getElementById("create-btn");
const updateBtn = document.getElementById("update-btn");
const deleteBtn = document.getElementById("delete-btn");
const getByIdBtn = document.getElementById("get-by-id-btn");
const resetBtn = document.getElementById("reset-btn");

// Генерация нового id 
function getNextId() {
  if (products.length === 0) return 1;
  const maxId = Math.max(...products.map(p => p.id));
  return maxId + 1;
}

// Отрисовка списка 
function renderProducts() {
  listEl.innerHTML = "";
  products.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `id: ${p.id} | ${p.name} — ${p.price} ₽`;
    listEl.appendChild(li);
  });
}

// Создание товара 
createBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (!name || !price) {
    alert("Введите название и стоимость");
    return;
  }

  const newProduct = {
    id: getNextId(),
    name,
    price
  };

  products.push(newProduct);
  renderProducts();
  clearForm();
});

// Получить товар по id 
getByIdBtn.addEventListener("click", () => {
  const id = Number(idInput.value);
  if (!id) {
    alert("Введите id");
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    alert("Товар не найден");
    return;
  }

  nameInput.value = product.name;
  priceInput.value = product.price;
});

// Обновить товар 
updateBtn.addEventListener("click", () => {
  const id = Number(idInput.value);
  if (!id) {
    alert("Введите id для обновления");
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) {
    alert("Товар не найден");
    return;
  }

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (name) product.name = name;
  if (price) product.price = price;

  renderProducts();
  clearForm();
});

// Удалить товар 
deleteBtn.addEventListener("click", () => {
  const id = Number(idInput.value);
  if (!id) {
    alert("Введите id для удаления");
    return;
  }

  const exists = products.some(p => p.id === id);
  if (!exists) {
    alert("Товар не найден");
    return;
  }

  products = products.filter(p => p.id !== id);
  renderProducts();
  clearForm();
});

// Сброс формы
resetBtn.addEventListener("click", clearForm);

function clearForm() {
  idInput.value = "";
  nameInput.value = "";
  priceInput.value = "";
}

// Стартовая отрисовка списка
renderProducts();
