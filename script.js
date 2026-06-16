import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function probarConexion() {
    const { data, error } = await supabase.from('categories').select('*').limit(1)

    if (error) {
        console.error('Error de conexión:', error.message)
    } else {
        console.log('¡Conexión exitosa! Datos:', data)
    }
}

probarConexion()
