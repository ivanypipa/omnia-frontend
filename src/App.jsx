// src/App.jsx
import CajasNavApp from './clientes/CajasNav/App';
import ConsultorioApp from './clientes/Consultorio/App';

const cliente = 'Consultorio'; // o 'Consultorio'

export default function App() {
  if (cliente === 'CajasNav') return <CajasNavApp />;
  if (cliente === 'Consultorio') return <ConsultorioApp />;
  return <div className="flex items-center justify-center h-screen text-gray-500">
    Cliente no autorizado
  </div>;
}
