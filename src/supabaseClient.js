import { createClient } from '@supabase/supabase-js'

// 🔐 Reemplazá con tu URL y ANON KEY reales desde el panel de Supabase
const supabaseUrl = 'https://lxwkafmogbdfoijrravw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4d2thZm1vZ2JkZm9panJyYXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NDIzMDQsImV4cCI6MjA2MjIxODMwNH0.LVLmRzOdO5L_lVQ3xVQwzl8OodpBp4zf7UgxgbIFSMY'

export const supabase = createClient(supabaseUrl, supabaseKey)
