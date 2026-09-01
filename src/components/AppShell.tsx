import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, spacing } from '@/constants/theme';
import { Brand } from '@/components/Brand';
import { NotifButton } from '@/components/NotifButton';
import { Sidebar } from '@/components/Sidebar';
import { UserPill } from '@/components/UserPill';
import { Reveal } from '@/components/anim/Reveal';
import { useAuthStore } from '@/store/useAuthStore';

const roleLabel: Record<string, string> = {
  owner: 'Owner',
  manajer: 'Manajer',
  kasir: 'Kasir',
  karyawan: 'Karyawan',
};

interface Props {
  /** Konten tengah top bar (mis. tanggal, judul, atau period switcher). */
  headerCenter?: ReactNode;
  /** Aksi di kanan top bar sebelum notifikasi & user pill (mis. tombol export). */
  headerRight?: ReactNode;
  children: ReactNode;
  /** Padding konten (default true). Set false untuk layar yang mengatur sendiri. */
  scroll?: boolean;
}

/**
 * Kerangka aplikasi untuk layar ber-navigasi (Dashboard, Laporan):
 * top bar + sidebar (di layar lebar) + area konten.
 */
export function AppShell({ headerCenter, headerRight, children, scroll = true }: Props) {
  const { width } = useWindowDimensions();
  const showSidebar = width >= 900;
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* TOP BAR */}
      <Reveal style={styles.topbar} offset={-8} duration={320}>
        <Brand />
        <View style={styles.center}>{headerCenter}</View>
        {headerRight}
        <NotifButton />
        <UserPill
          name={user?.name ?? 'Pengguna'}
          role={roleLabel[user?.role ?? 'kasir'] ?? 'Kasir'}
          avatar={user?.avatar ?? '👤'}
          onPress={signOut}
        />
      </Reveal>

      {/* BODY */}
      <View style={styles.body}>
        {showSidebar ? <Sidebar /> : null}
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { flex: 1 }]}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.cream },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.cream,
  },
  center: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1, flexDirection: 'row' },
  content: {
    padding: spacing.xl,
    gap: 14,
  },
});
