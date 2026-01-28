import { createClient } from '@supabase/supabase-js';

// Fallback credentials from your configuration
// These are used if the environment variables are not loaded automatically by the runtime
const FALLBACK_URL = 'https://okikohhxokoewkdqkyku.supabase.co';
const FALLBACK_KEY = 'sb_publishable_YC3CghebJ-tVPHcw5kAQ8g_s6w3ZNnA';

// Helper to safely get environment variables from various sources (Process or Vite)
const getEnv = (key: string) => {
  // 1. Check process.env (Standard Node/CRA/Webpack)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // 2. Check import.meta.env (Vite)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }

  // 3. Fallback for Vite users who might use VITE_ prefix instead of REACT_APP_
  const viteKey = key.replace('REACT_APP_', 'VITE_');
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }

  return '';
};

// Load variables: Try environment first, then use hardcoded fallback
const RAW_URL = getEnv('REACT_APP_SUPABASE_URL') || FALLBACK_URL;
const RAW_KEY = getEnv('REACT_APP_SUPABASE_ANON_KEY') || FALLBACK_KEY;

// Validate configuration
const isUrlValid = RAW_URL && RAW_URL !== 'YOUR_SUPABASE_URL_HERE';
const isKeyValid = RAW_KEY && RAW_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE';

export const isSupabaseConfigured = isUrlValid && isKeyValid;

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key is missing or invalid.');
}

// Use defaults if valid, otherwise placeholders (though fallback ensures they are likely valid now)
const validUrl = isUrlValid ? RAW_URL : 'https://placeholder.supabase.co';
const validKey = isKeyValid ? RAW_KEY : 'placeholder';

export const supabase = createClient(validUrl, validKey);

export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  color: string;
};

export type ShiftTypeSQL = {
  id: string;
  company?: string;
  name: string;
  color: string;
  default_start?: string;
  default_end?: string;
  default_duration?: number;
};

export type DayAssignmentSQL = {
  id: string;
  profile_id: string;
  date: string;
  shift_type_id?: string;
  note?: string;
  is_holiday?: boolean;
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
};

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password?: string) {
  if (password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  } else {
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return data.user; 
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export default supabase;