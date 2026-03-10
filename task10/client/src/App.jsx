import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductEditPage from './pages/ProductEditPage';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <div className="nav-brand-icon">🛒</div>
                <span>Task 10</span>
            </Link>
            <div className="nav-links">
                {user ? (
                    <>
                        <Link to="/products" className="nav-link">Товары</Link>
                        <span className="nav-user-email">{user.email}</span>
                        <button className="btn-logout" onClick={handleLogout}>Выйти</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Вход</Link>
                        <Link to="/register" className="nav-link">Регистрация</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Загрузка...</div>;
    return user ? children : <Navigate to="/login" />;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Загрузка...</div>;
    return !user ? children : <Navigate to="/products" />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                        <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
                        <Route path="/products/:id" element={<PrivateRoute><ProductDetailPage /></PrivateRoute>} />
                        <Route path="/products/:id/edit" element={<PrivateRoute><ProductEditPage /></PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/products" />} />
                    </Routes>
                </main>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
