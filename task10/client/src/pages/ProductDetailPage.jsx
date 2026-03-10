import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/api/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => setError(err.response?.data?.error || 'Товар не найден'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Удалить этот товар?')) return;
        try {
            await api.delete(`/api/products/${id}`);
            navigate('/products');
        } catch (err) {
            alert('Ошибка: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div className="page-container"><div className="loading">Загрузка...</div></div>;
    if (error) return (
        <div className="page-container">
            <div className="alert alert-error">{error}</div>
            <Link to="/products" className="btn btn-secondary">← Назад</Link>
        </div>
    );

    return (
        <div className="page-container">
            <Link to="/products" className="back-link">← К списку товаров</Link>

            <div className="detail-card">
                <div className="detail-category">{product.category}</div>
                <h1 className="detail-title">{product.title}</h1>
                <p className="detail-desc">{product.description}</p>
                <div className="detail-price">{product.price} ₽</div>
                <div className="detail-id">ID: {product.id}</div>

                <div className="detail-actions">
                    <Link to={`/products/${id}/edit`} className="btn btn-accent">✏️ Редактировать</Link>
                    <button className="btn btn-danger" onClick={handleDelete}>🗑 Удалить</button>
                </div>
            </div>
        </div>
    );
}
