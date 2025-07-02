import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, processLock } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://vvvrivcdvwucbaakvnxu.supabase.co'
const publishablekey = 'sb_publishable_rFb7TE-2-I9bzS4g8KCcig_Lm08K7hh'

if (!supabaseUrl || !publishablekey) {
  throw new Error('Supabase URL and Anon Key must be defined in environment variables.')
}

// No-op storage for SSR or non-React Native environments
const noopStorage = {
  getItem: async (key: string) => null,
  setItem: async (key: string, value: string) => {},
  removeItem: async (key: string) => {},
}

const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

export const supabase = createClient(supabaseUrl, publishablekey, {
  auth: {
    storage: isReactNative ? AsyncStorage : noopStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
