import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function ProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const canCreate = user && (user.role === 'seller' || user.role === 'admin');
    const canEdit = user && (user.role === 'seller' || user.role === 'admin');
    const canDelete = user && user.role === 'admin';

    const loadProducts = async () => {
        try {
            const { data } = await api.get('/api/products');
            setProducts(data);
        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);
        try {
            await api.post('/api/products', {
                ...form,
                price: Number(form.price),
            });
            setForm({ title: '', category: '', description: '', price: '' });
            setShowForm(false);
            await loadProducts();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Ошибка создания');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Удалить этот товар?')) return;
        try {
            await api.delete(`/api/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Ошибка удаления: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return <div className="page-container"><div className="loading">Загрузка...</div></div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>📦 Товары</h1>
                {canCreate && (
                    <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Закрыть' : '+ Добавить товар'}
                    </button>
                )}
            </div>

            {showForm && canCreate && (
                <div className="create-form-card">
                    <h3>Новый товар</h3>
                    {formError && <div className="alert alert-error">{formError}</div>}
                    <form onSubmit={handleCreate}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Название</label>
                                <input name="title" value={form.title} onChange={handleChange} placeholder="MacBook Pro" required />
                            </div>
                            <div className="form-group">
                                <label>Категория</label>
                                <input name="category" value={form.category} onChange={handleChange} placeholder="Ноутбуки" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Описание</label>
                                <input name="description" value={form.description} onChange={handleChange} placeholder="Мощный ноутбук" required />
                            </div>
                            <div className="form-group">
                                <label>Цена (₽)</label>
                                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="149990" required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Создание...' : 'Создать'}
                        </button>
                    </form>
                </div>
            )}

            {products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>Нет товаров. {canCreate ? 'Добавьте первый!' : 'Ожидайте добавления.'}</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map(p => (
                        <div className="product-card" key={p.id}>
                            <div className="product-category">{p.category}</div>
                            <h3 className="product-title">{p.title}</h3>
                            <p className="product-desc">{p.description}</p>
                            <div className="product-footer">
                                <span className="product-price">{p.price} ₽</span>
                                <div className="product-actions">
                                    <Link to={`/products/${p.id}`} className="btn-icon" title="Подробнее">👁</Link>
                                    {canEdit && (
                                        <Link to={`/products/${p.id}/edit`} className="btn-icon" title="Редактировать">✏️</Link>
                                    )}
                                    {canDelete && (
                                        <button className="btn-icon btn-danger" onClick={() => handleDelete(p.id)} title="Удалить">🗑</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
