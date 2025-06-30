// src/DevLogin.jsx
import { useState } from 'react'

// Define aquí tus clientes “de prueba”
const clients = [
  { slug: 'CajasNav', username: 'Gaston',   password: '1234' },
  { slug: 'Consultorio', username: 'proderma', password: '1234' }
]

export default function DevLogin({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    const match = clients.find(
      c => c.username === user.trim() && c.password === pass
    )
    if (match) {
      setError('')
      onLogin(match.slug)
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#242424',
        color: '#fff'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
          border: '1px solid #555',
          borderRadius: '8px',
          width: '300px'
        }}
      >
        <input
          placeholder="Usuario"
          value={user}
          onChange={e => setUser(e.target.value)}
          autoFocus
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #444',
            background: '#333',
            color: '#fff'
          }}
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #444',
            background: '#333',
            color: '#fff'
          }}
        />
        {error && (
          <div style={{ color: 'tomato', fontSize: '0.9rem' }}>{error}</div>
        )}
        <button
          type="submit"
          style={{
            padding: '0.75rem',
            borderRadius: '4px',
            border: 'none',
            background: '#646cff',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
