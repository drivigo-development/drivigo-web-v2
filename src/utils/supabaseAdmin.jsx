import { createClient } from '@supabase/supabase-js';

// For Create React App, environment variables must be prefixed with REACT_APP_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);
