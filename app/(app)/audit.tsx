import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { Card, CardHeader } from '@/components/Card';
import { PressableScale } from '@/components/anim/PressableScale';
import { palette, radius } from '@/constants/theme';
import {
  ACTION_META,
  activityLogs,
  cashRecon,
  opnameSession,
} from '@/data/mockAudit';
import { useAuthStore } from '@/store/useAuthStore';
import { formatRupiah } from '@/utils/format';

type Tab = 'log' | 'opname' | 'kas';

const TABS: { key: Tab; label: string }[] = [
  { key: 'log', label: 'Log Aktivitas' },
  { key: 'opname', label: 'Opname Stok' },
  { key: 'kas', label: 'Rekonsiliasi Kas' },
];

export default function AuditScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const [tab, setTab] = useState<Tab>('log');

  // Akses Audit: Owner (penuh) & Manajer (lihat). Lainnya ditolak (PRD §03).
  if (role && role !== 'owner' && role !== 'manajer') {
    return (
      <AppShell headerCenter={<Text style={styles.headerTitle}>Audit</Text>}>
        <Card>
          <Text style={styles.restrictedTitle}>🔒 Akses Terbatas</Text>
          <Text style={styles.restrictedText}>
            Modul Audit hanya dapat diakses oleh Owner dan Manajer.
          </Text>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerCenter={
        <View>
          <Text style={styles.headerTitle}>Audit</Text>
          <Text style={styles.headerSub}>Jejak aktivitas & rekonsiliasi</Text>
        </View>
      }
    >
      {/* TABS */}
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <PressableScale
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && { color: palette.white }]}>{t.label}</Text>
            </PressableScale>
          );
        })}
      </View>

      {tab === 'log' ? <ActivityLogView /> : null}
      {tab === 'opname' ? <OpnameView /> : null}
      {tab === 'kas' ? <CashReconView /> : null}
    </AppShell>
  );
}

function ActivityLogView() {
  return (
    <Card>
      <CardHeader title="Log Aktivitas" subtitle="Semua aksi penting tercatat & tidak dapat dihapus" />
      <View style={{ gap: 8 }}>
        {activityLogs.map((log) => {
          const meta = ACTION_META[log.type];
          return (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logTimeCol}>
                <Text style={styles.logTime}>{log.time}</Text>
                <Text style={styles.logDate}>{log.date}</Text>
              </View>
              <View style={styles.logLine} />
              <View style={{ flex: 1 }}>
                <View style={styles.logTopRow}>
                  <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.badgeText, { color: meta.fg }]}>{meta.label}</Text>
                  </View>
                  <Text style={styles.logUser}>{log.user}</Text>
                </View>
                <Text style={styles.logDetail}>{log.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function OpnameView() {
  const rows = opnameSession.map((r) => {
    const diff = r.physicalStock - r.systemStock;
    return { ...r, diff, value: diff * r.costPrice };
  });
  const totalLoss = rows.reduce((sum, r) => sum + Math.min(r.value, 0), 0);
  const mismatches = rows.filter((r) => r.diff !== 0).length;

  return (
    <>
      <View style={styles.summaryRow}>
        <SummaryCard label="Produk Diperiksa" value={String(rows.length)} icon="📋" />
        <SummaryCard label="Selisih Ditemukan" value={String(mismatches)} icon="⚠️" color={palette.amber} />
        <SummaryCard label="Nilai Kerugian" value={formatRupiah(Math.abs(totalLoss))} icon="💸" color={palette.coral} />
      </View>
      <Card style={{ padding: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tr, { backgroundColor: palette.cream }]}>
              <Text style={[styles.th, { width: 200 }]}>Produk</Text>
              <Text style={[styles.th, { width: 90 }]}>Sistem</Text>
              <Text style={[styles.th, { width: 90 }]}>Fisik</Text>
              <Text style={[styles.th, { width: 80 }]}>Selisih</Text>
              <Text style={[styles.th, { width: 120 }]}>Nilai</Text>
            </View>
            {rows.map((r) => (
              <View key={r.name} style={styles.tr}>
                <View style={[styles.td, { width: 200, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
                  <Text style={styles.tdText}>{r.name}</Text>
                </View>
                <Text style={[styles.td, styles.tdText, { width: 90 }]}>{r.systemStock} {r.unit}</Text>
                <Text style={[styles.td, styles.tdText, { width: 90 }]}>{r.physicalStock} {r.unit}</Text>
                <Text
                  style={[
                    styles.td,
                    { width: 80, fontWeight: '700', color: r.diff === 0 ? palette.g700 : palette.coral },
                  ]}
                >
                  {r.diff > 0 ? '+' : ''}{r.diff}
                </Text>
                <Text style={[styles.td, { width: 120, color: r.value < 0 ? palette.coral : palette.muted }]}>
                  {r.value === 0 ? '—' : formatRupiah(r.value)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
    </>
  );
}

function CashReconView() {
  const rows = cashRecon.map((r) => ({ ...r, diff: r.counted - r.expected }));
  const totalExpected = rows.reduce((s, r) => s + r.expected, 0);
  const totalCounted = rows.reduce((s, r) => s + r.counted, 0);
  const totalDiff = totalCounted - totalExpected;

  return (
    <>
      <View style={styles.summaryRow}>
        <SummaryCard label="Kas Seharusnya" value={formatRupiah(totalExpected)} icon="🧾" />
        <SummaryCard label="Kas Dihitung" value={formatRupiah(totalCounted)} icon="💵" />
        <SummaryCard
          label="Selisih"
          value={formatRupiah(totalDiff)}
          icon={totalDiff === 0 ? '✅' : '⚠️'}
          color={totalDiff === 0 ? palette.g700 : palette.coral}
        />
      </View>
      <Card style={{ padding: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tr, { backgroundColor: palette.cream }]}>
              <Text style={[styles.th, { width: 140 }]}>Metode</Text>
              <Text style={[styles.th, { width: 140 }]}>Seharusnya</Text>
              <Text style={[styles.th, { width: 140 }]}>Dihitung</Text>
              <Text style={[styles.th, { width: 120 }]}>Selisih</Text>
            </View>
            {rows.map((r) => (
              <View key={r.method} style={styles.tr}>
                <Text style={[styles.td, styles.tdText, { width: 140, fontWeight: '600' }]}>{r.method}</Text>
                <Text style={[styles.td, styles.tdText, { width: 140 }]}>{formatRupiah(r.expected)}</Text>
                <Text style={[styles.td, styles.tdText, { width: 140 }]}>{formatRupiah(r.counted)}</Text>
                <Text
                  style={[
                    styles.td,
                    { width: 120, fontWeight: '700', color: r.diff === 0 ? palette.g700 : palette.coral },
                  ]}
                >
                  {r.diff === 0 ? '—' : (r.diff > 0 ? '+' : '') + formatRupiah(r.diff)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
    </>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color = palette.text,
}: {
  label: string;
  value: string;
  icon: string;
  color?: string;
}) {
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

  // tabs
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

  // summary
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
  summaryValue: { fontWeight: '800', fontSize: 18, marginTop: 2 },

  // activity log
  logRow: { flexDirection: 'row', gap: 12 },
  logTimeCol: { width: 46, alignItems: 'flex-end' },
  logTime: { fontSize: 12.5, fontWeight: '700', color: palette.text },
  logDate: { fontSize: 10, color: palette.muted },
  logLine: { width: 2, backgroundColor: palette.border, borderRadius: 1 },
  logTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  logUser: { fontSize: 12, fontWeight: '600', color: palette.text },
  logDetail: { fontSize: 12.5, color: palette.muted, lineHeight: 18, paddingBottom: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  // tables
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.border2, alignItems: 'center' },
  th: { fontSize: 10, fontWeight: '700', color: palette.muted, paddingHorizontal: 12, paddingVertical: 9, textTransform: 'uppercase' },
  td: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 12.5 },
  tdText: { color: palette.text },
});
