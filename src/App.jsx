import { useState } from 'react'
import './App.css'

// ¡IMPORTANTE! Ajustá el import si tu estructura cambia
import ConsultorioApp from './clientes/Consultorio/App.jsx'

export default function App() {
  // Estado de login y usuario
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [logeado, setLogeado] = useState(false);
  const [error, setError] = useState('');

  // Usuario y clave "hardcodeados" para ejemplo
  const USER_REAL = 'admin';
  const PASS_REAL = ' ';

  const handleLogin = (e) => {
    e.preventDefault();
    if (usuario === USER_REAL && contrasenia === PASS_REAL) {
      setLogeado(true);
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  if (!logeado) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #dbeafe 100%)',
      }}>
        <form
          onSubmit={handleLogin}
          className="shadow-xl"
          style={{
            minWidth: 340,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 32px #0002',
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            alignItems: 'center',
          }}
        >
          <svg width="44" height="44" fill="none" viewBox="0 0 44 44">
            <rect width="44" height="44" rx="12" fill="#3b82f6"/>
            <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="22" fontFamily="Arial" dy=".3em">🔒</text>
          </svg>
          <h2 style={{margin: 0, fontWeight: 700, color: '#222'}}>Iniciar sesión</h2>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              padding: 12,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              width: '100%',
              fontSize: 16,
              background: '#f3f6fa',
              color: '#333'
            }}
            autoFocus
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            style={{
              padding: 12,
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              width: '100%',
              fontSize: 16,
              background: '#f3f6fa',
              color: '#333'
            }}
            required
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
              color: '#fff',
              fontWeight: 600,
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              fontSize: 17,
              cursor: 'pointer',
              width: '100%',
              marginTop: 8,
              boxShadow: '0 2px 8px #2563eb22'
            }}
          >
            Entrar
          </button>
          {error && <div style={{ color: '#dc2626', fontSize: 15, marginTop: 5 }}>{error}</div>}
        </form>
      </div>
    );
  }

  // Luego del login, muestro tu app real
  return <ConsultorioApp />;
}
