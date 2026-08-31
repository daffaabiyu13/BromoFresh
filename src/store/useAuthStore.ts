import { create } from 'zustand';
import type { AuthUser } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  /** Muat sesi yang tersimpan saat aplikasi dibuka. */
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

/** User demo dipakai saat Supabase belum dikonfigurasi. */
const DEMO_USER: AuthUser = {
  id: 'demo-owner',
  name: 'Budi Santoso',
  role: 'owner',
  avatar: '👨',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    if (!isSupabaseConfigured) {
      set({ user: DEMO_USER, loading: false });
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const u = data.session.user;
      set({
        user: {
          id: u.id,
          name: (u.user_metadata?.name as string) ?? u.email ?? 'Pengguna',
          role: (u.user_metadata?.role as AuthUser['role']) ?? 'kasir',
          avatar: (u.user_metadata?.avatar as string) ?? '👤',
        },
        loading: false,
      });
    } else {
      set({ user: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      // Mode demo: terima kredensial apa pun.
      set({ user: DEMO_USER });
      return {};
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const u = data.user;
    set({
      user: {
        id: u.id,
        name: (u.user_metadata?.name as string) ?? u.email ?? 'Pengguna',
        role: (u.user_metadata?.role as AuthUser['role']) ?? 'kasir',
        avatar: (u.user_metadata?.avatar as string) ?? '👤',
      },
    });
    return {};
  },

  signOut: async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    set({ user: null });
  },
}));
