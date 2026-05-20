import React from 'react';

const About = () => {
  return (
    <div className="page">
      <h2>О проекте</h2>
      <p>
        Это приложение было обновлено для соответствия современным стандартам дизайна.
        Здесь используется эффект <strong>Grainient</strong> для фона, который работает на WebGL через библиотеку OGL.
      </p>
      <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
        <ul style={{ margin: 0 }}>
          <li><strong>Vite</strong> — молниеносная сборка</li>
          <li><strong>Lazy Loading</strong> — подгрузка этого компонента только при переходе</li>
          <li><strong>Bundle Visualizer</strong> — контроль размера каждой зависимости</li>
          <li><strong>OGL Shaders</strong> — высокопроизводительная анимация</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
