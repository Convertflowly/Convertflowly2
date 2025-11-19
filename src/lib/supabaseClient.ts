import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not set. Authentication features will be disabled.');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Anon key loaded:', !!supabaseAnonKey);
console.log('Service role key loaded:', !!supabaseServiceRoleKey);
if (!supabaseServiceRoleKey) {
  console.warn('WARNING: Service role key is not set. Admin features will not work!');
}

// Custom storage that tries localStorage first, falls back to sessionStorage
const customStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key) || sessionStorage.getItem(key);
    } catch {
      return sessionStorage.getItem(key);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      sessionStorage.setItem(key, value); // Also store in session as backup
    } catch {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      sessionStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: customStorage,
  },
});

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: customStorage,
        // Use separate storage key to avoid GoTrueClient collision warnings
        storageKey: 'sb-admin-auth-token',
      },
    })
  : supabase;
