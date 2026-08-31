import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { AuthUser, UserRole } from '@/types';
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

const VALID_ROLES: UserRole[] = ['owner', 'manajer', 'kasir', 'karyawan'];

/** Ambil role dari user_metadata bila valid, jika tidak default 'kasir'. */
function metaRole(u: User): UserRole {
  const r = u.user_metadata?.role as UserRole | undefined;
  return r && VALID_ROLES.includes(r) ? r : 'kasir';
}

/**
 * Bangun AuthUser dengan **profiles sebagai sumber kebenaran** untuk role/nama.
 * Bila baris profil belum ada (mis. trigger belum aktif), fallback ke
 * user_metadata agar login tetap berfungsi.
 */
async function resolveAuthUser(u: User): Promise<AuthUser> {
  const { data } = await supabase
    .from('profiles')
    .select('name, role, avatar')
    .eq('id', u.id)
    .maybeSingle();

  if (data) {
    return {
      id: u.id,
      name: (data.name as string) ?? u.email ?? 'Pengguna',
      role: (data.role as UserRole) ?? 'kasir',
      avatar: (data.avatar as string) ?? '👤',
    };
  }

  return {
    id: u.id,
    name: (u.user_metadata?.name as string) ?? u.email ?? 'Pengguna',
    role: metaRole(u),
    avatar: (u.user_metadata?.avatar as string) ?? '👤',
  };
}

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
      set({ user: await resolveAuthUser(data.session.user), loading: false });
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
    set({ user: await resolveAuthUser(data.user) });
    return {};
  },

  signOut: async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    set({ user: null });
  },
}));
