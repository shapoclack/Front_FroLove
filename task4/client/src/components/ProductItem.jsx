export function ProductItem({ product, onEdit, onDelete }) {
  return (
    <div className="userRow">
      <div className="userMain">
        <div className="userId">{product.id}</div>
        <div className="userName">{product.name}</div>
        <div className="userAge">
          {product.category} • {product.price} ₽ • Остаток: {product.stock}
          {product.rating != null && ` • ★ ${product.rating}`}
        </div>
      </div>
      <div className="userActions">
        <button className="btn" onClick={onEdit}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={onDelete}>
          Удалить
        </button>
      </div>
    </div>
  );
}
