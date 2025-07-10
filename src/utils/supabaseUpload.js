import { supabase } from '../supabaseClient'

const SUPABASE_URL = 'https://lxwkafmogbdfoijrravw.supabase.co' // igual a la de tu client

export async function subirArchivo({ empresa, chat_id, archivo }) {
  if (!archivo) return null
  const nombreLimpio = archivo.name.replace(/\s/g, "_")
  const path = `${empresa}/${chat_id}/${Date.now()}_${nombreLimpio}`
  const { data, error } = await supabase
    .storage
    .from('mensajes')
    .upload(path, archivo)

  if (error) throw error

  // Usa la misma URL base
  const url = `${SUPABASE_URL}/storage/v1/object/public/mensajes/${path}`

  return {
    url,
    path,
    file_name: archivo.name,
    mime_type: archivo.type,
    file_size: archivo.size,
  }
}
