import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { Card, CardHeader } from '@/components/Card';
import { palette, radius } from '@/constants/theme';
import { cashierPerformance, roleLabel } from '@/data/mockEmployees';
import { useEmployees } from '@/lib/queries';
import { useAuthStore } from '@/store/useAuthStore';
import { formatRupiah, formatShort } from '@/utils/format';
import type { UserRole } from '@/types';

const ROLE_STYLE: Record<UserRole, { bg: string; fg: string }> = {
  owner: { bg: palette.g900, fg: palette.white },
  manajer: { bg: palette.skyLight, fg: palette.sky },
  kasir: { bg: palette.g50, fg: palette.g700 },
  karyawan: { bg: palette.amberLight, fg: palette.amber },
};

export default function KaryawanScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const { data: employees = [] } = useEmployees();
  const [tab, setTab] = useState<'daftar' | 'performa'>('daftar');

  const summary = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter((e) => e.active).length,
      kasir: employees.filter((e) => e.role === 'kasir').length,
    };
  }, [employees]);

  // Karyawan: Owner (penuh) & Manajer (lihat). Lainnya ditolak (PRD §03).
  if (role && role !== 'owner' && role !== 'manajer') {
    return (
      <AppShell headerCenter={<Text style={styles.headerTitle}>Karyawan</Text>}>
        <Card>
          <Text style={styles.restrictedTitle}>🔒 Akses Terbatas</Text>
          <Text style={styles.restrictedText}>
            Modul Karyawan hanya dapat diakses oleh Owner dan Manajer.
          </Text>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerCenter={
        <View>
          <Text style={styles.headerTitle}>Karyawan</Text>
          <Text style={styles.headerSub}>Manajemen tim & performa</Text>
        </View>
      }
    >
      {/* SUMMARY */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Total Karyawan" value={summary.total} icon="👥" />
        <SummaryCard label="Aktif" value={summary.active} icon="✅" color={palette.g700} />
        <SummaryCard label="Kasir" value={summary.kasir} icon="🧾" color={palette.sky} />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {(['daftar', 'performa'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && { color: palette.white }]}>
              {t === 'daftar' ? 'Daftar Karyawan' : 'Performa Penjualan'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'daftar' ? (
        <View style={styles.grid}>
          {employees.map((e) => {
            const rs = ROLE_STYLE[e.role];
            return (
              <View key={e.id} style={styles.empCard}>
                <View style={styles.empTop}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 22 }}>{e.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.empName}>{e.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: rs.bg }]}>
                      <Text style={[styles.roleText, { color: rs.fg }]}>{roleLabel[e.role]}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: e.active ? palette.g500 : palette.muted }]} />
                </View>
                <View style={styles.empMeta}>
                  <Text style={styles.metaLine}>📞 {e.phone}</Text>
                  <Text style={styles.metaLine}>📅 Bergabung {e.joinedAt}</Text>
                  <Text style={[styles.metaLine, { color: e.active ? palette.g700 : palette.muted }]}>
                    {e.active ? '● Aktif' : '○ Nonaktif'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <Card style={{ padding: 0 }}>
          <CardHeader title="Performa Kasir" subtitle="Bulan ini" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 560 }}>
              <View style={[styles.tr, { backgroundColor: palette.cream }]}>
                <Text style={[styles.th, { width: 180 }]}>Kasir</Text>
                <Text style={[styles.th, { width: 90 }]}>Transaksi</Text>
                <Text style={[styles.th, { width: 130 }]}>Omset</Text>
                <Text style={[styles.th, { width: 110 }]}>Rata-rata</Text>
                <Text style={[styles.th, { width: 70 }]}>Void</Text>
              </View>
              {cashierPerformance.map((p) => (
                <View key={p.name} style={styles.tr}>
                  <View style={[styles.td, { width: 180, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                    <Text style={{ fontSize: 18 }}>{p.avatar}</Text>
                    <Text style={styles.tdText}>{p.name}</Text>
                  </View>
                  <Text style={[styles.td, styles.tdText, { width: 90 }]}>{p.transactions}</Text>
                  <Text style={[styles.td, styles.tdText, { width: 130, fontWeight: '700' }]}>{formatShort(p.revenue)}</Text>
                  <Text style={[styles.td, styles.tdText, { width: 110 }]}>{formatRupiah(p.avgTransaction)}</Text>
                  <Text style={[styles.td, { width: 70, fontWeight: '700', color: p.voids > 3 ? palette.coral : palette.muted }]}>
                    {p.voids}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Card>
      )}
    </AppShell>
  );
}

function SummaryCard({ label, value, icon, color = palette.text }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryIcon}>{icon}</Text>
      </View>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontWeight: '700', fontSize: 15, color: palette.text },
  headerSub: { fontSize: 11, color: palette.muted },
  restrictedTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 6 },
  restrictedText: { fontSize: 13, color: palette.muted, lineHeight: 19 },

  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 170,
    minWidth: 170,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: palette.muted },
  summaryIcon: { fontSize: 15 },
  summaryValue: { fontWeight: '800', fontSize: 20, marginTop: 2 },

  tabs: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: 3,
    alignSelf: 'flex-start',
  },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 7 },
  tabActive: { backgroundColor: palette.g900 },
  tabText: { fontSize: 12.5, fontWeight: '600', color: palette.muted },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  empCard: {
    flexGrow: 1,
    flexBasis: 260,
    minWidth: 260,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 14,
    gap: 12,
  },
  empTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: palette.g100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empName: { fontSize: 14, fontWeight: '700', color: palette.text, marginBottom: 4 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  roleText: { fontSize: 10, fontWeight: '700' },
  statusDot: { width: 9, height: 9, borderRadius: 4.5 },
  empMeta: { gap: 3, borderTopWidth: 1, borderTopColor: palette.border2, paddingTop: 10 },
  metaLine: { fontSize: 12, color: palette.muted },

  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.border2, alignItems: 'center' },
  th: { fontSize: 10, fontWeight: '700', color: palette.muted, paddingHorizontal: 12, paddingVertical: 9, textTransform: 'uppercase' },
  td: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 12.5 },
  tdText: { color: palette.text },
});
