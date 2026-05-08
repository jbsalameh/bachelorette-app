import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null if not configured — components fall back to localStorage
export const supabase =
  url && key && url.startsWith('https')
    ? createClient(url, key)
    : null;

export const isSupabaseConfigured = !!supabase;
