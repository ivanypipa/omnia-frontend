import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';         // estilos globales
import App from './App.jsx';  // tu router entre clientes

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
