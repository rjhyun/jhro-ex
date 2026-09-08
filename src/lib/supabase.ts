/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const getStoredUrl = () => {
  try {
    return localStorage.getItem('exs02.supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  } catch {
    return import.meta.env.VITE_SUPABASE_URL || '';
  }
};

const getStoredKey = () => {
  try {
    return localStorage.getItem('exs02.supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  } catch {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }
};

export function isSupabaseConfigured(): boolean {
  const url = getStoredUrl();
  const key = getStoredKey();
  return Boolean(
    url && 
    key && 
    url !== 'https://your-project.supabase.co' &&
    key !== 'your-supabase-anon-key' &&
    url.includes('supabase.co')
  );
}

export function getSupabaseClient() {
  const url = getStoredUrl() || 'https://placeholder.supabase.co';
  const key = getStoredKey() || 'placeholder-key';
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = getSupabaseClient();
