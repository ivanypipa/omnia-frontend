import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

const EMPRESA = 'Consultorio';
const categorias = ['general', 'pedidos', 'quejas', 'facturas'];

// ... (igual que arriba, pero con EMPRESA='Consultorio')
function ChatList({ chats, mensajes, onSelectChat, activeId }) {
  // mismo código que en CajasNav
}

function ChatWindow({ chat, mensajes, onSendMessage, onChangeCategory, onRenameChat }) {
  // mismo código que en CajasNav
}

export default function App() {
  const [chats, setChats] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [chatSel, setChatSel] = useState(null);

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('empresa', EMPRESA);
    if (error) console.error(error);
    else setChats(data);
  };

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
