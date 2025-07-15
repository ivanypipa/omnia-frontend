

export default function ChatWindow({
  chat,
  mensajes = [],
  onSendMessage,
  onChangeCategory,
  onRenameChat
}) {
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Selecciona un chat para ver los mensajes
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
      {/* Header del chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div>
          <div className="font-semibold text-lg">{chat.nombre}</div>
          <div className="text-xs text-gray-500">{chat.numero}</div>
        </div>
        <div className="flex gap-2">
          {/* Selector de categoría */}
          <select
            value={chat.categoria}
            onChange={(e) => onChangeCategory && onChangeCategory(e.target.value)}
            className="rounded border-gray-300 px-2 py-1 text-sm"
          >
            <option value="general">General</option>
            <option value="recetas">Recetas</option>
            <option value="preguntas">Preguntas</option>
            <option value="turnos">Turnos</option>
          </select>
          {/* Botón de editar nombre */}
          <button
            onClick={() => {
              const nuevo = prompt("Nuevo nombre para el chat:", chat.nombre);
              if (nuevo && onRenameChat) onRenameChat(chat.id, nuevo);
            }}
            className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
          >
            Renombrar
          </button>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f2f5]">
        {mensajes.length === 0 && (
          <div className="text-gray-400 text-center">No hay mensajes</div>
        )}
        {mensajes.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm ${
              msg.tipo === "entrante"
                ? "bg-white self-start"
                : "bg-blue-100 self-end"
            }`}
          >
            <div>{msg.texto}</div>
            <div className="text-[10px] text-gray-400 text-right">
              {msg.timestamp &&
                new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Input para enviar mensaje */}
      <form
        className="flex items-center p-4 border-t border-gray-200 bg-white"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.target.elements.texto;
          const texto = input.value.trim();
          if (texto && onSendMessage) {
            onSendMessage(texto);
            input.value = "";
          }
        }}
      >
        <input
          name="texto"
          type="text"
          placeholder="Escribí un mensaje..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-gray-50"
          autoComplete="off"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
