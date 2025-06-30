// src/DevLogin.jsx
import { useState, useMemo } from 'react'

// 1) Auto-detectar carpetas dentro de /clientes
const modules = import.meta.glob('./clientes/*/App.jsx')
const slugs = useMemo(
  () => Object.keys(modules)
               .map(path => path.match(/clientes\/(.+)\/App\.jsx/)?.[1])
               .filter(Boolean),
  []
)

export default function DevLogin({ onLogin }) {
  const [slug, setSlug] = useState(slugs[0] || '')
  const [pass, setPass] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    // aquí podrías opcionalmente validar pass === '1234'
    onLogin(slug)
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Login de Desarrollo</h2>
      <label>
        Cliente:
        <select value={slug} onChange={e => setSlug(e.target.value)}>
          {slugs.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>
      <br/><br/>
      <label>
        Contraseña (no válida realmente):
        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
      </label>
      <br/><br/>
      <button type="submit">Entrar</button>
    </form>
  )
}
