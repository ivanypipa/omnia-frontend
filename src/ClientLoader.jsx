// src/ClientLoader.jsx
import { useState, useEffect, Suspense } from 'react'

export default function ClientLoader({ clientSlug }) {
  const modules = import.meta.glob('./clientes/*/App.jsx')
  const importer = modules[`./clientes/${clientSlug}/App.jsx`]

  const [ClientApp, setClientApp] = useState(null)

  useEffect(() => {
    setClientApp(null)
    if (!importer) return
    importer().then(mod => setClientApp(() => mod.default))
  }, [clientSlug])

  if (!importer) return <p>No existe frontend para “{clientSlug}”.</p>
  if (!ClientApp) return <p>Cargando frontend de “{clientSlug}”…</p>
  
  return (
    <Suspense fallback={<p>Cargando UI…</p>}>
      <ClientApp />
    </Suspense>
  )
}
