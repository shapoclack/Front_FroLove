import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form.email, form.first_name, form.last_name, form.password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">📝</div>
                <h1>Регистрация</h1>
                <p className="auth-subtitle">Создайте новый аккаунт</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="ivan@mail.ru" required />
                    </div>
                    <div className="form-group">
                        <label>Имя</label>
                        <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Иван" required />
                    </div>
                    <div className="form-group">
                        <label>Фамилия</label>
                        <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Иванов" required />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="auth-link">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
}
