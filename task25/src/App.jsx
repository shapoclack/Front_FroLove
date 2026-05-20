import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Grainient from './components/Grainient';

const Home = () => (
  <div className="page">
    <h2>Главная страница</h2>
    <p>Добро пожаловать в современное демонстрационное приложение на Vite!</p>
    <p>Этот проект демонстрирует использование инструментов сборки, оптимизацию производительности и эстетичные визуальные эффекты.</p>
  </div>
);

const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <div className="app-wrapper">
      <Grainient 
        colors={['#360e35', '#731680', '#1a051d']}
        speed={0.15}
        grainAmount={0.07}
      />
      
      <Router>
        <div className="app-container">
          <header>
            <h1>Task 25: Build Tools</h1>
            <nav>
              <NavLink to="/" end>Главная</NavLink>
              <NavLink to="/about">О нас</NavLink>
            </nav>
          </header>
          
          <main>
            <Suspense fallback={<div className="loading">Загрузка компонента...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </div>
  );
}

export default App;
