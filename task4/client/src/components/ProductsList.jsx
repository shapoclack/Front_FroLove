import { ProductItem } from "./ProductItem";

export function ProductsList({ products, onEdit, onDelete }) {
  if (!products.length) {
    return <div className="empty">Товаров пока нет</div>;
  }

  return (
    <div className="list">
      {products.map((p) => (
        <ProductItem
          key={p.id}
          product={p}
          onEdit={() => onEdit(p)}
          onDelete={() => onDelete(p.id)}
        />
      ))}
    </div>
  );
}
