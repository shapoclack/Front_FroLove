import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadUsers = async () => {
        try {
            const { data } = await api.get('/api/users');
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleToggleBlock = async (id) => {
        try {
            const { data } = await api.delete(`/api/users/${id}`);
            setUsers(users.map(u => u.id === id ? data.user : u));
        } catch (err) {
            alert('Ошибка: ' + (err.response?.data?.error || err.message));
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return <span className="role-badge" data-role="admin">👑 Админ</span>;
            case 'seller': return <span className="role-badge" data-role="seller">🏪 Продавец</span>;
            default: return <span className="role-badge" data-role="user">👤 Пользователь</span>;
        }
    };

    if (loading) return <div className="page-container"><div className="loading">Загрузка...</div></div>;
    if (error) return <div className="page-container"><div className="alert alert-error">{error}</div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>👥 Пользователи</h1>
            </div>

            {users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">👤</div>
                    <p>Нет зарегистрированных пользователей</p>
                </div>
            ) : (
                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Имя</th>
                                <th>Фамилия</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className={u.blocked ? 'row-blocked' : ''}>
                                    <td className="td-id">{u.id}</td>
                                    <td>{u.email}</td>
                                    <td>{u.first_name}</td>
                                    <td>{u.last_name}</td>
                                    <td>{getRoleBadge(u.role)}</td>
                                    <td>
                                        <span className={`status-badge ${u.blocked ? 'status-blocked' : 'status-active'}`}>
                                            {u.blocked ? '🚫 Заблокирован' : '✅ Активен'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/users/${u.id}/edit`} className="btn-icon" title="Редактировать">✏️</Link>
                                            <button
                                                className={`btn-icon ${u.blocked ? 'btn-success' : 'btn-danger'}`}
                                                onClick={() => handleToggleBlock(u.id)}
                                                title={u.blocked ? 'Разблокировать' : 'Заблокировать'}
                                            >
                                                {u.blocked ? '🔓' : '🔒'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
