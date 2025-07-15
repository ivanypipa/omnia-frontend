import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabaseClient'
import { subirArchivo } from "../../utils/supabaseUpload"
import { Paperclip, X, Send } from "lucide-react";
import ContactList from './ContactList';


// Convierte '0' (o null / undefined) a 'general' y todo a lowercase


/* 🔑 Empresa fija para este build */
const EMPRESA = 'Consultorio'
const categorias = ['general', 'recetas', 'preguntas', 'turnos']


const normalizarCategoria = (cat) => {
  if (cat === 'uno') return 'general'
  return cat.toString().toLowerCase().trim()
}

/***************************  LISTA DE CHATS  ***************************/
function ChatList({ chats, mensajesGlobal, onSelectChat, activeId }) {
  

  const [filtros, setFiltros] = useState(
    categorias.reduce((acc, c) => ({ ...acc, [c]: '' }), {})
  )

  const handleFiltroChange = (cat, v) =>
    setFiltros((p) => ({ ...p, [cat]: v }))

  return (
    
    <div className="flex h-full">
      {categorias.map((cat) => (
        <div key={cat} className="w-[200px] min-w-[200px] border-r border-[#e0e0e0]">
          <div className="h-12 flex items-center justify-center font-semibold text-sm text-gray-700 bg-[#e8f0fe] border-b uppercase">
            {cat}
          </div>
          <div className="p-2">
            <input
              value={filtros[cat]}
              onChange={(e) => handleFiltroChange(cat, e.target.value)}
              placeholder="Buscar..."
              className="w-full px-2 py-1 bg-white shadow text-gray-800 border-gray-300"
            />
          </div>
          <ul className="list-none p-0 m-0">
            {chats
              .filter((c) => {
            // normalizarCategoria already maps '1' → 'general'
              const categoriaNorm = normalizarCategoria(c.categoria)
              return categoriaNorm === cat
                && c.nombre.toLowerCase().includes(filtros[cat].toLowerCase())
            })
              .map((chat) => {
                const estaActivo = chat.id === activeId
                // calculamos con todos los mensajes
                const chatMsgs = mensajesGlobal.filter((m) => m.chat_id === chat.id)
                const ultimo = chatMsgs[chatMsgs.length - 1]
                // badge si último tipo es 'entrante' y no está activo
                const mostrarBadge = !estaActivo && ultimo?.tipo === 'entrante'

                return (
                  <li
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`flex items-center justify-between p-2 cursor-pointer border-b border-[#e0e0e0] ${
                      estaActivo ? 'bg-blue-100' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center overflow-hidden">
                      <div className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-gray-300 mr-2" />
                      <div className="flex flex-col justify-center">
                        <span className="font-semibold text-gray-800 truncate max-w-[120px]">
                          {chat.nombre}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[140px]">
                          {chat.ultimoMensaje || '\u00A0'}
                        </span>
                      </div>
                    </div>
                    {mostrarBadge && <span className="w-3 h-3 rounded-full bg-red-500 mr-1" />}
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </div>
  )
}

/***************************  VENTANA DE CHAT  ***************************/

function ChatWindow({ chat, mensajes, onSendMessage, onChangeCategory, onRenameChat }) {
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imgZoom, setImgZoom] = useState(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const mensajesDivRef = useRef(null);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes, isAtBottom]);

  if (!chat) return <div className="flex-1 bg-[#f0f2f5]" />

  // Maneja selección de archivo y preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivo(file);
      if (file.type.startsWith("image")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // Quita archivo y libera preview
  const handleRemoveFile = () => {
    setArchivo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Enviar mensaje o archivo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !archivo) return;

    if (archivo) {
      try {
        const uploadData = await subirArchivo({
          empresa: chat.empresa || 'Consultorio',
          chat_id: chat.id,
          archivo,
        });

        await onSendMessage({
          texto: nuevoMensaje,
          // tipo: deducido en frontend por mime_type, no se guarda tipo_contenido
          url: uploadData.url,
          file_name: uploadData.file_name,
          mime_type: uploadData.mime_type,
          file_size: uploadData.file_size,
        });

        setNuevoMensaje('');
      } catch (error) {
        alert('Error subiendo archivo: ' + error.message);
      }
    } else if (nuevoMensaje.trim()) {
      await onSendMessage(nuevoMensaje);
      setNuevoMensaje('');
    }

    setArchivo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Editar nombre de chat
  const handleRename = () => {
    const nuevo = prompt('Nuevo nombre de chat:', chat.nombre);
    if (nuevo && nuevo.trim() && nuevo !== chat.nombre) {
      onRenameChat(nuevo.trim());
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#f0f2f5]">
      {/* Header */}
      <div className="h-12 bg-[#e8f0fe] flex justify-between items-center px-4 border-b border-[#e0e0e0]">
        <span className="font-semibold text-gray-800">{chat.nombre}</span>
        <div className="flex items-center space-x-2">
          <button onClick={handleRename} className="p-1 bg-white rounded hover:bg-gray-200">✏️</button>
          <select
            value={chat.categoria}
            onChange={(e) => onChangeCategory(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white text-gray-800"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mensajes */}
      <div
        className="flex-1 p-5 overflow-y-auto"
        ref={mensajesDivRef}
        onScroll={() => {
          const el = mensajesDivRef.current;
          if (!el) return;
          const bottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 2;
          setIsAtBottom(bottom);
        }}
      >
        {mensajes.map((m) => {
          const hora = new Date(m.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          const saliente = m.tipo === 'saliente';
          const tipoContenido =
            (m.mime_type && m.mime_type.startsWith('image') && 'imagen') ||
            (m.mime_type && m.mime_type.startsWith('audio') && 'audio') ||
            (m.mime_type && m.mime_type.startsWith('video') && 'video') ||
            m.tipo || 'texto';

          return (
            <div key={m.id} className={`flex mb-3 ${saliente ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-xl max-w-[70%] shadow text-sm ${saliente ? 'bg-[#d2e3fc] text-gray-800' : 'bg-white text-gray-800 border border-[#e0e0e0]'}`}>
                {/* Imagen */}
                {tipoContenido === 'imagen' && m.url && (
                  <img
                    src={m.url}
                    alt={m.file_name || 'imagen'}
                    className="max-w-[220px] max-h-[220px] rounded mb-2 cursor-pointer"
                    style={{ objectFit: "cover" }}
                    onClick={() => {
                      console.log("Click en imagen!", m.url);
                      setImgZoom(m.url)
                    }}
                    loading="lazy"
                  />
                  
                )}
                
                {/* Audio */}
                {tipoContenido === 'audio' && m.url && (
                  <audio controls src={m.url} className="mb-2" style={{ width: 200 }} />
                )}
                {/* Texto */}
                {m.texto && <div>{m.texto}</div>}
                {/* Otro archivo */}
                {tipoContenido === 'archivo' && m.url && (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {m.file_name || "Descargar archivo"}
                  </a>
                )}
                <div className="text-xs text-gray-400 text-right mt-1">{hora}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Formulario de mensaje */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white"
        style={{ boxShadow: '0 -2px 6px 0 rgba(0,0,0,0.03)' }}
      >
        {/* Botón de Adjuntar Archivo */}
        <label className="cursor-pointer flex items-center p-2 rounded-full hover:bg-gray-100 transition">
          <Paperclip size={22} className="text-gray-400" />
          <input
            type="file"
            accept="image/*,audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Input Mensaje */}
        <input
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          autoComplete="off"
        />

        {/* Archivo adjunto (solo si NO es imagen) */}
        {archivo && !previewUrl && (
          <div className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1 text-xs">
            <span className="text-gray-700">{archivo.name}</span>
            <button type="button" onClick={handleRemoveFile} className="text-gray-500 hover:text-red-500">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Preview de imagen */}
        {previewUrl && (
          <div className="flex items-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 object-cover rounded mr-2 border cursor-pointer"
              onClick={() => setImgZoom(previewUrl)}
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-red-500"
              title="Quitar"
            >
              <X size={16} />
            </button>
            <span className="ml-2 text-xs text-gray-700">{archivo?.name}</span>
          </div>
        )}

        {/* Botón Enviar */}
        <button
          type="submit"
          className="ml-2 bg-blue-600 hover:bg-blue-700 rounded-full p-2 flex items-center justify-center transition"
          style={{ minWidth: 44, minHeight: 44 }}
          aria-label="Enviar"
        >
          <Send size={22} className="text-white" />
        </button>
      </form>

      {/* MODAL de zoom para imagen */}
      {imgZoom && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setImgZoom(null)}
          style={{ cursor: 'zoom-out' }}
        >
          <img
            src={imgZoom}
            alt="Vista grande"
            className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}


/***************************  APP PRINCIPAL  ***************************/
export default function App() {
  const [chats, setChats] = useState([])
  const [mensajesGlobal, setMensajesGlobal] = useState([])
  const [chatSeleccionado, setChatSeleccionado] = useState(null)
  const [pestania, setPestania] = useState('chats'); // o 'contactos'

  /* ---- Helpers para BD ---- */
  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('empresa', EMPRESA)
    if (error) console.error('fetchChats error:', error)
    setChats(
    (data || []).map((c) => ({ ...c, categoria: normalizarCategoria(c.categoria) }))
  )
  }

  const fetchAllMensajes = async () => {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('empresa', EMPRESA)
      .order('timestamp', { ascending: true })
    if (error) console.error('fetchAllMensajes error:', error)
  setMensajesGlobal(
    (data || []).map((m) => ({ ...m, categoria: normalizarCategoria(m.categoria) }))
  )
  }

  /* ---- Efectos ---- */
  useEffect(() => {
    fetchChats()
    fetchAllMensajes()
    const interval = setInterval(() => {
      fetchChats()
      fetchAllMensajes()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  /* ---- Acciones ---- */
  const handleSelectChat = (chat) => {
    setChatSeleccionado(chat)
  }

  const handleSendMessage = async (mensaje) => {
  if (!chatSeleccionado) return
  const now = new Date().toISOString()
    
  let row
  if (typeof mensaje === 'string') {
    // Solo texto
    row = {
      chat_id: chatSeleccionado.id,
      texto: mensaje,
      tipo: 'saliente', // <- mensaje enviado por vos
      timestamp: now,
      empresa: EMPRESA,
      categoria: normalizarCategoria(chatSeleccionado.categoria),
    }
  } else {
    // Multimedia
    row = {
      chat_id: chatSeleccionado.id,
      texto: mensaje.texto || '',
      tipo: 'saliente',        // <- así se alinea a la derecha
      url: mensaje.url,
      file_name: mensaje.file_name,
      mime_type: mensaje.mime_type,
      file_size: mensaje.file_size,

      timestamp: now,
      empresa: EMPRESA,
    }
  }

  const { error } = await supabase.from('mensajes').insert([row])
  if (error) return console.error('insert mensaje error:', error)
  await fetchAllMensajes()
  await fetchChats()
}


 const handleCategoryChange = async (category) => {
  if (!chatSeleccionado) return;
  // Actualiza en Supabase
  await supabase.from('chats').update({ categoria: category }).eq('id', chatSeleccionado.id);
  // Actualiza localmente el chatSeleccionado (esto fuerza el select a reflejar el cambio)
  setChatSeleccionado({ ...chatSeleccionado, categoria: category });
  // Además, actualiza la lista de chats
  setChats((prev) =>
    prev.map((c) =>
      c.id === chatSeleccionado.id ? { ...c, categoria: category } : c
    )
  );
  fetchChats(); // Opcional, por si otro campo cambió
};


  const handleRenameChat = async (nuevoNombre) => {
    if (!chatSeleccionado) return
    await supabase.from('chats').update({ nombre: nuevoNombre }).eq('id', chatSeleccionado.id)
    fetchChats()
    setChatSeleccionado({ ...chatSeleccionado, nombre: nuevoNombre })
  }

  // mensajes filtrados para ventana
  const mensajesChat = mensajesGlobal.filter((m) => m.chat_id === chatSeleccionado?.id)

  /* ---- Render ---- */
 return (
  <div className="min-h-screen w-screen bg-[#f0f2f5] flex flex-col font-sans">
    {/* Menú/tab arriba, siempre fijo */}
    <div className="w-full flex justify-center pt-2 pb-2 bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="flex gap-2">
        <button
          className={`
            px-7 py-1 rounded-t-lg text-base font-medium transition
            focus:outline-none
            ${pestania === 'chats'
              ? 'border-2 border-blue-500 text-blue-600 bg-white shadow-md'
              : 'border-2 border-transparent text-gray-400 bg-gray-100'}
          `}
          onClick={() => setPestania('chats')}
          style={{ minWidth: 120 }}
        >
          Chats
        </button>
        <button
          className={`
            px-7 py-1 rounded-t-lg text-base font-medium transition
            focus:outline-none
            ${pestania === 'contactos'
              ? 'border-2 border-blue-500 text-blue-600 bg-white shadow-md'
              : 'border-2 border-transparent text-gray-400 bg-gray-100'}
          `}
          onClick={() => setPestania('contactos')}
          style={{ minWidth: 120 }}
        >
          Contactos
        </button>
      </div>
    </div>

    {/* Contenido cambia según la pestaña */}
    {pestania === 'chats' ? (
      <div className="flex flex-1 overflow-hidden">
        <ChatList
          chats={chats}
          mensajesGlobal={mensajesGlobal}
          onSelectChat={handleSelectChat}
          activeId={chatSeleccionado?.id}
        />
        {/* ChatWindow ocupa el resto del espacio */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow
            chat={chatSeleccionado}
            mensajes={mensajesChat}
            onSendMessage={handleSendMessage}
            onChangeCategory={handleCategoryChange} 
            onRenameChat={handleRenameChat}
          />
        </div>
      </div>
    ) : (
      <div className="flex-1 flex justify-center items-start bg-[#f0f2f5] pt-10 overflow-auto">
        <ContactList
          chats={chats}
          onRenameChat={async (id, nuevoNombre) => {
            await supabase.from('chats').update({ nombre: nuevoNombre }).eq('id', id);
            fetchChats();
          }}
        />
      </div>
    )}
  </div>
)

}
