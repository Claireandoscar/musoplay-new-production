// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug logging for environment variables
console.log('Supabase Environment Check:', {
  hasUrl: !!supabaseUrl,
  urlFirstChars: supabaseUrl?.substring(0, 20),
  hasKey: !!supabaseAnonKey,
  keyFirstChars: supabaseAnonKey?.substring(0, 20)
});

// Initialize Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'musoplay-auth'
  }
})

// Initialize auth and check session
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', {
    event,
    hasSession: !!session,
    email: session?.user?.email,
    timestamp: new Date().toISOString()
  });
});

// Check initial session
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Initial session check:', {
    hasSession: !!session,
    email: session?.user?.email,
    timestamp: new Date().toISOString()
  });
});