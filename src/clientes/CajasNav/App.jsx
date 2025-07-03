import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

const EMPRESA = 'CajasNav';
const categorias = ['general', 'pedidos', 'quejas', 'facturas'];

function ChatList({ chats, mensajes, onSelectChat, activeId }) {
  const [filtros, setFiltros] = useState(
    categorias.reduce((acc, c) => ({ ...acc, [c]: '' }), {})
  );

  const handleFiltroChange = (cat, value) => {
    setFiltros((prev) => ({ ...prev, [cat]: value }));
  };

  return (
    <div className="flex h-full">
      {categorias.map((cat) => (
        <div key={cat} className="w-[200px] min-w-[200px] border-r border-red-200">
          <div className="h-12 flex items-center justify-center font-semibold text-sm text-white bg-red-700 border-b border-red-500 uppercase">
            {cat}
          </div>
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full px-2 py-1 bg-white shadow text-gray-800 border border-red-300 focus:outline-none focus:ring-2 focus:ring-green-600 rounded"
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
                const sinLeer = mensajes.filter(
                  (m) => m.chat_id === chat.id && m.tipo === 'entrante' && !m.leido
                ).length;
                const activo = chat.id === activeId;
                return (
                  <li
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`flex items-center justify-between p-2 cursor-pointer border-b border-red-200 ${
                      activo ? 'bg-red-100' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-green-200 mr-2 flex-shrink-0" />
                      <div className="flex flex-col justify-center">
                        <div className="font-semibold text-gray-800 truncate max-w-[120px]">
                          {chat.nombre}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[140px]">
                          {chat.ultimoMensaje || '\u00A0'}
                        </div>
                      </div>
                    </div>
                    {sinLeer > 0 && (
                      <span className="bg-red-600 text-white text-xs rounded-full px-2">
                        {sinLeer}
                      </span>
                    )}
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
  const [nuevo, setNuevo] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const submit = (e) => {
    e.preventDefault();
    if (!nuevo.trim()) return;
    onSendMessage(nuevo);
    setNuevo('');
  };

  if (!chat) return <div className="flex-1 bg-green-50" />;

  return (
    <div className="flex flex-col flex-1 h-screen bg-green-50">
      <div className="h-12 bg-green-700 text-white font-semibold flex justify-between items-center px-4 border-b border-green-600">
        <span>{chat.nombre}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const nn = prompt('Nuevo nombre:', chat.nombre);
              if (nn && nn.trim() !== chat.nombre) onRenameChat(nn.trim());
            }}
            className="p-1 rounded bg-white hover:bg-gray-200 transition"
            title="Cambiar nombre"
          >
            ✏️
          </button>
          <select
            value={chat.categoria}
            onChange={(e) => onChangeCategory(e.target.value)}
            className="px-2 py-1 border rounded text-sm bg-white"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          {chat.categoria !== 'general' && (
            <button
              onClick={() => onChangeCategory('general')}
              className="px-3 py-1 bg-red-700 text-white rounded text-sm hover:bg-red-800 transition"
            >
              Terminar
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 p-5 overflow-y-auto">
        {mensajes.map((m, i) => {
          const hora = new Date(m.timestamp).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const sal = m.tipo === 'saliente';
          return (
            <div key={i} className={`flex ${sal ? 'justify-end' : 'justify-start'} mb-3`}>
              <div
                className={`px-4 py-2 rounded-xl max-w-[70%] text-sm shadow ${
                  sal
                    ? 'bg-yellow-100 text-gray-800'
                    : 'bg-white text-gray-900 border border-green-200'
                }`}
              >
                <div>{m.texto}</div>
                <div className="text-xs text-right text-gray-500 mt-1">{hora}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="flex p-4 bg-white border-t border-green-200 items-center shadow">
        <input
          type="text"
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 px-4 py-2 rounded-full border bg-white shadow text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        <button type="submit" className="ml-3 px-5 py-2 rounded-full bg-red-700 text-white font-bold hover:bg-red-800 transition">
          Enviar
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [chats, setChats] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [chatSel, setChatSel] = useState(null);

  // traer solo los chats de CajasNav
  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('empresa', EMPRESA);
    if (error) console.error(error);
    else setChats(data);
  };

  // traer solo los mensajes de CajasNav
  const fetchMensajes = async () => {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('empresa', EMPRESA)
      .order('timestamp', { ascending: true });
    if (error) console.error(error);
    else setMensajes(data);
  };

  useEffect(() => {
    fetchChats();
    fetchMensajes();
    const i = setInterval(() => {
      fetchChats();
      fetchMensajes();
    }, 5000);
    return () => clearInterval(i);
  }, []);

  const handleSendMessage = async (texto) => {
    const nuevo = {
      chat_id: chatSel.id,
      texto,
      tipo: 'saliente',
      leido: true,
      timestamp: new Date().toISOString(),
      empresa: EMPRESA,
    };
    await supabase.from('mensajes').insert([nuevo]);
    fetchMensajes();
    fetchChats();
  };

  const handleCategoryChange = async (cat) => {
    if (!chatSel) return;
    await supabase.from('chats').update({ categoria: cat }).eq('id', chatSel.id);
    fetchChats();
    setChatSel(cat === 'general' ? null : { ...chatSel, categoria: cat });
  };

  const handleRenameChat = async (nombre) => {
    if (!chatSel) return;
    await supabase.from('chats').update({ nombre }).eq('id', chatSel.id);
    fetchChats();
    setChatSel((c) => ({ ...c, nombre }));
  };

  const mensajesDelChat = mensajes.filter((m) => m.chat_id === chatSel?.id);

  return (
    <div className="flex h-screen w-screen font-sans">
      <ChatList
        chats={chats}
        mensajes={mensajes}
        onSelectChat={setChatSel}
        activeId={chatSel?.id}
      />
      <ChatWindow
        chat={chatSel}
        mensajes={mensajesDelChat}
        onSendMessage={handleSendMessage}
        onChangeCategory={handleCategoryChange}
        onRenameChat={handleRenameChat}
      />
    </div>
  );
}
