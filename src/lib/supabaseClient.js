import { createClient } from '@supabase/supabase-js';

// Filled in once the Supabase project exists — see supabase/schema.sql for
// the one-time database setup. Both values are meant to be public: the
// anon key only grants whatever the table's Row Level Security policies
// allow (each user can read/write their own row, nothing else).
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  : null;
