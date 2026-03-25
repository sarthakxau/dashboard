import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

/** Returns true if Supabase env vars are configured */
export const isConfigured = Boolean(supabaseUrl && supabaseKey);

// Lazy-initialized client
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY. Copy .env.example to .env.');
    }
    _client = createClient(supabaseUrl, supabaseKey);
  }
  return _client;
}

// Convenience alias — most query files import this
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : (null as unknown as SupabaseClient);
