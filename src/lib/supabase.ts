import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Apakah kredensial Supabase sudah diisi.
 * Selama masih false, layar tetap berjalan memakai data contoh (mock) sehingga
 * aplikasi bisa didemokan tanpa backend. Isi file `.env` untuk mengaktifkan.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY belum diisi. ' +
      'Aplikasi berjalan dengan data contoh. Salin .env.example → .env untuk menghubungkan backend.',
  );
}

/**
 * Client Supabase. Di web, AsyncStorage tidak diperlukan (Supabase memakai
 * localStorage secara default), jadi kita hanya set storage di native.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);
