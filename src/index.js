import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Cria um "root" para a aplicação React e renderiza o componente App
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
