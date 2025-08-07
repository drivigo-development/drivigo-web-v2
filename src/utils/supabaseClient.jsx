import { createClient } from '@supabase/supabase-js'

// For Create React App, environment variables must be prefixed with REACT_APP_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: 'pkce',           // ← turn on PKCE
    detectSessionInUrl: true,   // ← auto-exchange code for you
    persistSession: true,
    autoRefreshToken: true,
  },
})
