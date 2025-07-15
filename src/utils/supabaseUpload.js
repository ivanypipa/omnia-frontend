import { supabase } from '../supabaseClient'

/**
 * Sube un archivo (imagen o audio) al bucket "mensajes"
 * y devuelve la URL pública y metadatos.
 */
export async function subirArchivo({ empresa, chat_id, archivo }) {
  if (!archivo) return {}

  // Generar nombre único
  const ext = archivo.name.split('.').pop()
  const timestamp = Date.now()
  const fileName = `${timestamp}.${ext}`
  const path = `${empresa}/${chat_id}/${fileName}`

  // 1) Subir al bucket "mensajes"
  const { error: uploadError } = await supabase
    .storage
    .from('mensajes')
    .upload(path, archivo, { cacheControl: '3600', upsert: false })

  if (uploadError) throw uploadError

  // 2) Obtener URL pública
  const {
    data: { publicUrl },
    error: urlError,
  } = supabase
    .storage
    .from('mensajes')
    .getPublicUrl(path)

  if (urlError) throw urlError

  return {
    url: publicUrl,
    path,
    file_name: fileName,
    mime_type: archivo.type,
    file_size: archivo.size,
  }
}
