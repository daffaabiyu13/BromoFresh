import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius } from '@/constants/theme';
import { criticalCount } from '@/data/mockStock';

interface NavItem {
  label: string;
  icon: string;
  href?: '/dashboard' | '/kasir' | '/laporan' | '/stok' | '/labarugi' | '/audit';
  alert?: number;
  group: 'Menu' | 'Manajemen';
}

/**
 * Item navigasi. Modul yang layarnya sudah ada memakai `href`; modul yang belum
 * diimplementasikan (sesuai roadmap PRD) tampil non-aktif tanpa href.
 */
const NAV: NavItem[] = [
  { label: 'Dashboard', icon: '▦', href: '/dashboard', group: 'Menu' },
  { label: 'Kasir', icon: '🛒', href: '/kasir', group: 'Menu' },
  { label: 'Laporan', icon: '📊', href: '/laporan', group: 'Menu' },
  { label: 'Stok', icon: '📦', href: '/stok', alert: criticalCount(), group: 'Menu' },
  { label: 'Laba Rugi', icon: '💵', href: '/labarugi', group: 'Menu' },
  { label: 'Audit', icon: '📄', href: '/audit', group: 'Menu' },
  { label: 'Karyawan', icon: '👥', group: 'Manajemen' },
  { label: 'Pengaturan', icon: '⚙️', group: 'Manajemen' },
];

export function Sidebar() {
  const pathname = usePathname();
  const groups: NavItem['group'][] = ['Menu', 'Manajemen'];

  return (
    <View style={styles.sidebar}>
      {groups.map((group) => (
        <View key={group} style={{ paddingTop: 8 }}>
          <Text style={styles.groupLabel}>{group}</Text>
          {NAV.filter((n) => n.group === group).map((item) => {
            const active = item.href ? pathname === item.href : false;
            const content = (
              <View style={[styles.item, active && styles.itemActive]}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                  {item.label}
                </Text>
                {item.alert ? (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertText}>{item.alert}</Text>
                  </View>
                ) : null}
                {!item.href ? <Text style={styles.soon}>Segera</Text> : null}
              </View>
            );

            if (!item.href) {
              return (
                <Pressable key={item.label} disabled style={{ opacity: 0.55 }}>
                  {content}
                </Pressable>
              );
            }
            return (
              <Link key={item.label} href={item.href} asChild>
                <Pressable>{content}</Pressable>
              </Link>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    minWidth: 200,
    backgroundColor: palette.white,
    borderRightWidth: 1,
    borderRightColor: palette.border,
    paddingVertical: 16,
  },
  groupLabel: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    color: palette.muted,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderLeftWidth: 2.5,
    borderLeftColor: 'transparent',
  },
  itemActive: {
    backgroundColor: palette.g50,
    borderLeftColor: palette.g900,
  },
  icon: { width: 18, fontSize: 14, textAlign: 'center' },
  itemLabel: { fontSize: 13, fontWeight: '500', color: palette.muted, flex: 1 },
  itemLabelActive: { color: palette.g900, fontWeight: '600' },
  alertBadge: {
    backgroundColor: palette.coral,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: { color: palette.white, fontSize: 10, fontWeight: '700' },
  soon: {
    fontSize: 9,
    color: palette.muted,
    backgroundColor: palette.cream,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
});
