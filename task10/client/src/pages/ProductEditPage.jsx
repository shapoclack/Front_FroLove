import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ProductEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', category: '', description: '', price: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/api/products/${id}`)
            .then(res => {
                const p = res.data;
                setForm({ title: p.title, category: p.category, description: p.description, price: p.price });
            })
            .catch(err => setError(err.response?.data?.error || 'Товар не найден'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.put(`/api/products/${id}`, {
                ...form,
                price: Number(form.price),
            });
            navigate(`/products/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка обновления');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="page-container"><div className="loading">Загрузка...</div></div>;

    return (
        <div className="page-container">
            <Link to={`/products/${id}`} className="back-link">← Назад к товару</Link>

            <div className="edit-card">
                <h2>✏️ Редактирование товара</h2>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Название</label>
                        <input name="title" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Категория</label>
                        <input name="category" value={form.category} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Описание</label>
                        <input name="description" value={form.description} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Цена (₽)</label>
                        <input name="price" type="number" value={form.price} onChange={handleChange} required />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <Link to={`/products/${id}`} className="btn btn-secondary">Отмена</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
