import { useState } from "react";

function ContactList({ chats, onRenameChat, onSelectChat, activeId }) {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Filtra por nombre o número
  const filtered = chats.filter(
    c =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.numero || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (id, nombre) => {
    setEditId(id);
    setEditValue(nombre);
  };

  const saveEdit = (id) => {
    if (editValue.trim()) onRenameChat(id, editValue.trim());
    setEditId(null);
  };

  return (
    <div className="w-full max-w-xs bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-2">
        <input
          type="text"
          placeholder="Buscar contacto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded bg-gray-50 text-gray-800 focus:outline-none"
        />
      </div>
      <ul className="flex-1 overflow-y-auto">
        {filtered.map(c => (
          <li
            key={c.id}
            className={`flex items-center justify-between px-4 py-2 border-b hover:bg-blue-50 transition cursor-pointer ${
              c.id === activeId ? "bg-blue-100" : ""
            }`}
            onClick={() => onSelectChat && onSelectChat(c)}
          >
            {/* Edición inline */}
            {editId === c.id ? (
              <input
                type="text"
                value={editValue}
                autoFocus
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => saveEdit(c.id)}
                onKeyDown={e => {
                  if (e.key === "Enter") saveEdit(c.id);
                  if (e.key === "Escape") setEditId(null);
                }}
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                style={{ minWidth: 0 }}
              />
            ) : (
              <span
                className="flex-1 text-gray-800 font-medium truncate"
                onDoubleClick={e => {
                  e.stopPropagation();
                  handleEdit(c.id, c.nombre);
                }}
                title={c.nombre}
              >
                {c.nombre}
              </span>
            )}
            <span className="ml-3 text-xs text-gray-500">{c.numero}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContactList;
