// src/DevLogin.jsx
import { useState, useMemo } from 'react'

export default function DevLogin({ onLogin }) {
  // 1) Detecta dinámicamente las carpetas
  const modules = import.meta.glob('./clientes/*/App.jsx')

  // 2) Construye la lista de slugs **dentro** del componente
  const slugs = useMemo(() => {
    return Object.keys(modules)
      .map(path => {
        const m = path.match(/clientes\/(.+)\/App\.jsx/)
        return m ? m[1] : null
      })
      .filter(Boolean)
  }, [modules])

  const [slug, setSlug] = useState(slugs[0] || '')
  const [pass, setPass] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    onLogin(slug)
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20, color: '#fff' }}>
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
        Contraseña (fake):
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

