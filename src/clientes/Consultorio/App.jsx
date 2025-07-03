import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabaseClient'

/* 🔑 Empresa fija para este build */
const EMPRESA = 'Consultorio'
const categorias = ['general', 'turnos', 'recetas', 'preguntas']

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
              .filter(
                (c) =>
                  (c.categoria || '').toLowerCase().trim() === cat &&
                  c.nombre.toLowerCase().includes(filtros[cat].toLowerCase())
              )
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
                    {mostrarBadge && <span className="w-2 h-2 rounded-full bg-red-500 mr-1" />}
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
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  if (!chat) return <div className="flex-1 bg-[#f0f2f5]" />

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nuevoMensaje.trim()) return
    onSendMessage(nuevoMensaje)
    setNuevoMensaje('')
  }

  const handleRename = () => {
    const nuevo = prompt('Nuevo nombre de chat:', chat.nombre)
    if (nuevo && nuevo.trim() && nuevo !== chat.nombre) {
      onRenameChat(nuevo.trim())
    }
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#f0f2f5]">
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
      <div className="flex-1 p-5 overflow-y-auto">
        {mensajes.map((m) => {
          const hora = new Date(m.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
          const saliente = m.tipo === 'saliente'
          return (
            <div key={m.id} className={`flex mb-3 ${saliente ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-xl max-w-[70%] shadow text-sm ${saliente ? 'bg-[#d2e3fc] text-gray-800' : 'bg-white text-gray-800 border border-[#e0e0e0]'}`}>
                <div>{m.texto}</div>
                <div className="text-xs text-gray-400 text-right mt-1">{hora}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex p-4 bg-white border-t border-[#e0e0e0] items-center">
        <input
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 px-4 py-2 rounded-full border bg-white shadow text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button type="submit" className="ml-3 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
          Enviar
        </button>
      </form>
    </div>
  )
}

/***************************  APP PRINCIPAL  ***************************/
export default function App() {
  const [chats, setChats] = useState([])
  const [mensajesGlobal, setMensajesGlobal] = useState([])
  const [chatSeleccionado, setChatSeleccionado] = useState(null)

  /* ---- Helpers para BD ---- */
  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('empresa', EMPRESA)
    if (error) console.error('fetchChats error:', error)
    setChats(data || [])
  }

  const fetchAllMensajes = async () => {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('empresa', EMPRESA)
      .order('timestamp', { ascending: true })
    if (error) console.error('fetchAllMensajes error:', error)
    setMensajesGlobal(data || [])
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

  const handleSendMessage = async (texto) => {
    if (!chatSeleccionado) return
    const now = new Date().toISOString()
    const { error } = await supabase.from('mensajes').insert([
      {
        chat_id: chatSeleccionado.id,
        texto,
        tipo: 'saliente',
        enviado: true,
        timestamp: now,
        empresa: EMPRESA,
      },
    ])
    if (error) return console.error('insert mensaje error:', error)
    // refrescar todas las listas
    await fetchAllMensajes()
    await fetchChats()
  }

  const handleCategoryChange = async (category) => {
    if (!chatSeleccionado) return
    await supabase.from('chats').update({ categoria: category }).eq('id', chatSeleccionado.id)
    fetchChats()
    setChatSeleccionado({ ...chatSeleccionado, categoria: category })
  }

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
    <div className="flex h-screen w-screen font-sans bg-[#f0f2f5]">
      <ChatList
        chats={chats}
        mensajesGlobal={mensajesGlobal}
        onSelectChat={handleSelectChat}
        activeId={chatSeleccionado?.id}
      />
      <ChatWindow
        chat={chatSeleccionado}
        mensajes={mensajesChat}
        onSendMessage={handleSendMessage}
        onChangeCategory={handleCategoryChange}
        onRenameChat={handleRenameChat}
      />
    </div>
  )
}
