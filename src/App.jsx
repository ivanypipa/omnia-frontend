import { useState } from 'react'
import CajasNavApp from './clientes/CajasNav/App.jsx'
import ConsultorioApp from './clientes/Consultorio/App.jsx'

export default function App() {
  const [cliente, setCliente] = useState(null)

  if (cliente === 'cajasnav') return <CajasNavApp />
  if (cliente === 'consultorio') return <ConsultorioApp />

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-6">Seleccioná un cliente</h1>
      <div className="flex gap-4">
        <button
          onClick={() => setCliente('cajasnav')}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-lg"
        >
          CajasNav
        </button>
        <button
          onClick={() => setCliente('consultorio')}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-lg"
        >
          Consultorio
        </button>
      </div>
    </div>
  )
}
