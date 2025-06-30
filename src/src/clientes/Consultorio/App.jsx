// App.jsx

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../supabaseClient';

const categorias = ['general', 'turnos', 'recetas', 'preguntas'];

function ChatList({ chats, mensajes, onSelectChat, activeId }) {
  const [filtros, setFiltros] = useState({
    general: '',
    turnos: '',
    recetas: '',
    preguntas: '',
  });

  const handleFiltroChange = (cat, value) => {
    setFiltros((prev) => ({ ...prev, [cat]: value }));
  };

  return (
    <div className="flex h-full">
      {categorias.map((cat) => (
        <div key={cat} className="w-[200px] min-w-[200px] border-r border-[#e0e0e0]">
          <div className="h-12 flex items-center justify-center font-semibold text-sm text-gray-700 bg-[#e8f0fe] border-b border-[#e0e0e0] uppercase">
            {cat}
          </div>
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full px-2 py-1 bg-white shadow text-gray-800 border-gray-300"
              value={filtros[cat]}
              onChange={(e) => handleFiltroChange(cat, e.target.value)}
            />
          </div>
          <ul className="list-none p-0 m-0">
            {chats
              .filter(
                (c) =>
                  (c.categoria || '').toLowerCase().trim() === cat &&
                  c.nombre.toLowerCase().includes(filtros[cat].toLowerCase())
              )
              .map((chat) => {
                const cantidadNoLeidos = mensajes.filter(
                  (m) => m.chat_id === chat.id && m.tipo === 'entrante' && !m.leido
                ).length;
                const estaActivo = chat.id === activeId;
                return (
                  <li
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`flex items-center justify-between p-2 cursor-pointer border-b border-[#e0e0e0] ${
                      estaActivo ? 'bg-blue-100' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center overflow-hidden">
                        <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-gray-300 mr-2 flex-shrink-0" />
                        <div className="flex flex-col justify-center">
                          <div className="font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                            {chat.nombre}
                          </div>
                          <div className="text-xs text-gray-500 min-h-[16px] truncate max-w-[140px]">
                            {chat.ultimoMensaje || '\u00A0'}
                          </div>
                        </div>
                      </div>
                      {cantidadNoLeidos > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2">
                          {cantidadNoLeidos}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ChatWindow({ chat, mensajes, onSendMessage, onChangeCategory, onRenameChat }) {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    onSendMessage(nuevoMensaje);
    setNuevoMensaje('');
  };

  const handleRename = () => {
    const nuevo = prompt('Nuevo nombre de chat:', chat.nombre);
    if (nuevo && nuevo.trim() && nuevo !== chat.nombre) {
      onRenameChat(nuevo.trim());
    }
  };

  if (!chat) return <div className="flex-1 bg-[#f0f2f5]" />;

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#f0f2f5]">
      <div className="h-12 bg-[#e8f0fe] text-gray-800 font-semibold flex justify-between items-center px-4 border-b border-[#e0e0e0]">
        <span>{chat.nombre}</span>
        <div className="flex items-center space-x-2">
          {/* Botón para renombrar */}
          <button
            onClick={handleRename}
            className="p-1 rounded bg-white hover:bg-gray-200 transition"
            title="Cambiar nombre"
          >
            ✏️
          </button>

          {/* Dropdown de categoría */}
          <select
            value={chat.categoria}
            onChange={(e) => onChangeCategory(e.target.value)}
            className="px-2 py-1 border rounded text-sm bg-white"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Botón "Terminar conversación" solo si NO está en categoría "general" */}
          {chat.categoria?.toLowerCase() !== 'general' && (
            <button
              onClick={() => onChangeCategory('general')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
            >
              Terminar conversación
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {mensajes.map((msg, i) => {
          const hora = new Date(msg.timestamp).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const isSaliente = msg.tipo === 'saliente';
          return (
            <div key={i} className={`flex ${isSaliente ? 'justify-end' : 'justify-start'} mb-3`}>
              <div
                className={`px-4 py-2 rounded-xl max-w-[70%] text-sm shadow ${
                  isSaliente
                    ? 'bg-[#d2e3fc] text-gray-800'
                    : 'bg-white text-gray-900 border border-[#e0e0e0]'
                }`}
              >
                <div>{msg.texto}</div>
                <div className="text-xs text-right text-gray-400 mt-1">{hora}</div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex p-4 bg-white border-t border-[#e0e0e0] items-center shadow"
      >
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 px-4 py-2 rounded-full border bg-white shadow text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="ml-3 px-5 py-2 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

function App() {
  const [chats, setChats] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(null);

  const fetchChats = async () => {
    const { data } = await supabase.from('chats').select('*');
    setChats(data || []);
  };

  const fetchMensajes = async () => {
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .order('timestamp', { ascending: true });
    setMensajes(data || []);
  };

  useEffect(() => {
    fetchChats();
    fetchMensajes();

    // Cada 5 segundos, refrescar automáticamente
    const interval = setInterval(() => {
      fetchChats();
      fetchMensajes();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (texto) => {
    const nuevo = {
      chat_id: chatSeleccionado.id,
      texto,
      tipo: 'saliente',
      leido: true,
      timestamp: new Date().toISOString(),
    };
    await supabase.from('mensajes').insert([nuevo]);
    // Luego de enviar, recargamos para ver el mensaje y actualizar chats
    await fetchMensajes();
    await fetchChats();
  };

  const handleCategoryChange = async (category) => {
    if (!chatSeleccionado?.id) return;
    const { error } = await supabase
      .from('chats')
      .update({ categoria: category })
      .eq('id', String(chatSeleccionado.id));
    if (error) {
      alert('Error al actualizar la categoría');
      return;
    }
    await fetchChats();
    if (category === 'general') {
      // Si paso a "general", limpiamos la selección de chat
      setChatSeleccionado(null);
    } else {
      setChatSeleccionado((prev) => (prev ? { ...prev, categoria: category } : null));
    }
  };

  const handleRenameChat = async (nuevoNombre) => {
    if (!chatSeleccionado?.id) return;
    const { error } = await supabase
      .from('chats')
      .update({ nombre: nuevoNombre })
      .eq('id', String(chatSeleccionado.id));
    if (error) {
      alert('Error al renombrar el chat');
      return;
    }
    await fetchChats();
    setChatSeleccionado((prev) => (prev ? { ...prev, nombre: nuevoNombre } : null));
  };

  const mensajesDelChat = mensajes.filter((m) => m.chat_id === chatSeleccionado?.id);

  return (
    <div className="flex h-screen w-screen font-sans bg-[#f0f2f5]">
      <ChatList
        chats={chats}
        mensajes={mensajes}
        onSelectChat={setChatSeleccionado}
        activeId={chatSeleccionado?.id}
      />
      <ChatWindow
        chat={chatSeleccionado}
        mensajes={mensajesDelChat}
        onSendMessage={handleSendMessage}
        onChangeCategory={handleCategoryChange}
        onRenameChat={handleRenameChat}
      />
    </div>
  );
}

export default App;
