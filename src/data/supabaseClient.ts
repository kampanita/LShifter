import { createClient } from '@supabase/supabase-js';

// Fallback credentials from your configuration
// These are used if the environment variables are not loaded automatically by the runtime
const FALLBACK_URL = 'https://okikohhxokoewkdqkyku.supabase.co';
const FALLBACK_KEY = 'sb_publishable_YC3CghebJ-tVPHcw5kAQ8g_s6w3ZNnA';

// Helper to safely get environment variables centered on Vite
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Try VITE_ prefix first (Standard for Vite)
    const viteKey = key.startsWith('VITE_') ? key : `VITE_${key.replace('REACT_APP_', '')}`;
    if (import.meta.env[viteKey]) return import.meta.env[viteKey];

    // Try original key
    if (import.meta.env[key]) return import.meta.env[key];
  }

  // Fallback to process.env for Node/Build environments
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  return '';
};

// Load variables: Try environment first, then use hardcoded fallback
const RAW_URL = getEnv('VITE_SUPABASE_URL') || getEnv('REACT_APP_SUPABASE_URL') || FALLBACK_URL;
const RAW_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('REACT_APP_SUPABASE_ANON_KEY') || FALLBACK_KEY;

// Validate configuration
const isUrlValid = RAW_URL && RAW_URL !== 'YOUR_SUPABASE_URL_HERE' && RAW_URL !== '';
const isKeyValid = RAW_KEY && RAW_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE' && RAW_KEY !== '';

export const isSupabaseConfigured = isUrlValid && isKeyValid;

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