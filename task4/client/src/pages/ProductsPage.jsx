import { useEffect, useState } from "react";
import { api } from "../api";
import { ProductsList } from "../components/ProductsList";
import { ProductModal } from "../components/ProductModal";

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch((err) => {
        console.error(err);
        alert("Ошибка загрузки товаров");
      });
  }, []);

  const openCreate = () => {
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Удалить товар?");
    if (!ok) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка удаления товара");
    }
  };

  const handleSubmitModal = async (payload) => {
    try {
      if (modalMode === "create") {
        const newProduct = await api.createProduct(payload);
        setProducts((prev) => [...prev, newProduct]);
      } else {
        const updated = await api.updateProduct(payload.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === payload.id ? updated : p))
        );
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Ошибка сохранения товара");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Shop App</div>
          <div className="header__right">React</div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Товары</h1>
            <button className="btn btn--primary" onClick={openCreate}>
              + Добавить товар
            </button>
          </div>

          <ProductsList
            products={products}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Shop App
        </div>
      </footer>

      <ProductModal
        open={modalOpen}
        mode={modalMode}
        product={editingProduct}
        onClose={closeModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
