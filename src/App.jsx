// src/App.jsx
import { useState } from 'react'
import DevLogin from './DevLogin'
import ClientLoader from './ClientLoader'

export default function App() {
  const [clientSlug, setClientSlug] = useState(null)

  if (!clientSlug) {
    return <DevLogin onLogin={setClientSlug} />
  }
  return <ClientLoader clientSlug={clientSlug} />
}
