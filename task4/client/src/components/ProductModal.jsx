import { useEffect, useState } from "react";

export function ProductModal({ open, mode, product, onClose, onSubmit }) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Редактировать товар" : "Создать товар";

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (isEdit && product) {
      setName(product.name ?? "");
      setCategory(product.category ?? "");
      setDescription(product.description ?? "");
      setPrice(product.price != null ? String(product.price) : "");
      setStock(product.stock != null ? String(product.stock) : "");
      setRating(product.rating != null ? String(product.rating) : "");
      setImage(product.image ?? "");
    } else {
      setName("");
      setCategory("");
      setDescription("");
      setPrice("");
      setStock("");
      setRating("");
      setImage("");
    }
  }, [isEdit, product, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = rating ? Number(rating) : undefined;

    if (!name.trim() || !category.trim() || !description.trim()) {
      alert("Заполните название, категорию и описание");
      return;
    }

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedStock)) {
      alert("Цена и количество должны быть числами");
      return;
    }

    const payload = {
      id: product?.id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parsedStock,
      rating: parsedRating,
      image: image.trim()
    };

    onSubmit(payload);
  };

  const handleBackdrop = () => {
    onClose();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="backdrop" onMouseDown={handleBackdrop}>
      <div
        className="modal"
        onMouseDown={stopPropagation}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            Название
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Игровая клавиатура"
              autoFocus
            />
          </label>

          <label className="label">
            Категория
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например, Периферия"
            />
          </label>

          <label className="label">
            Описание
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание товара"
            />
          </label>

          <label className="label">
            Цена (₽)
            <input
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
            />
          </label>

          <label className="label">
            Количество на складе
            <input
              className="input"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
            />
          </label>

          <label className="label">
            Рейтинг (опционально)
            <input
              className="input"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              inputMode="numeric"
            />
          </label>

          <label className="label">
            URL изображения (опционально)
            <input
              className="input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <div className="modal__footer">
            <button type="button" className="btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
