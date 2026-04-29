import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function UserEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', role: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/api/users/${id}`)
            .then(res => {
                const u = res.data;
                setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role });
            })
            .catch(err => setError(err.response?.data?.error || 'Пользователь не найден'))
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
            await api.put(`/api/users/${id}`, form);
            navigate('/users');
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка обновления');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="page-container"><div className="loading">Загрузка...</div></div>;

    return (
        <div className="page-container">
            <Link to="/users" className="back-link">← Назад к пользователям</Link>

            <div className="edit-card">
                <h2>✏️ Редактирование пользователя</h2>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Имя</label>
                        <input name="first_name" value={form.first_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Фамилия</label>
                        <input name="last_name" value={form.last_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Роль</label>
                        <select name="role" value={form.role} onChange={handleChange} className="form-select">
                            <option value="user">👤 Пользователь</option>
                            <option value="seller">🏪 Продавец</option>
                            <option value="admin">👑 Администратор</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <Link to="/users" className="btn btn-secondary">Отмена</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
