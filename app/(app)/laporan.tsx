import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { Card, CardHeader } from '@/components/Card';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { categoryColors, palette, radius, spacing } from '@/constants/theme';
import { generateTransactions, periodData, type ReportPeriod } from '@/data/mockReports';
import { formatRupiah, formatShort } from '@/utils/format';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTransactions } from '@/lib/queries';
import { useTransactionStore } from '@/store/useTransactionStore';
import type { Transaction } from '@/types';

const PERIOD_TABS: { key: ReportPeriod; label: string }[] = [
  { key: 'harian', label: 'Harian' },
  { key: 'mingguan', label: 'Mingguan' },
  { key: 'bulanan', label: 'Bulanan' },
  { key: 'tahunan', label: 'Tahunan' },
];

const CAT_PILLS = ['Semua', '🥬 Sayur', '🍊 Buah', '🛒 Sembako', '❄️ Frozen'];
const PAGE_SIZE = 10;

const ALL_TRX = generateTransactions();

export default function LaporanScreen() {
  const [period, setPeriod] = useState<ReportPeriod>('harian');
  const [catFilter, setCatFilter] = useState('Semua');
  const [chartView, setChartView] = useState<'bar' | 'line'>('bar');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const recorded = useTransactionStore((s) => s.transactions);
  const { data: dbTransactions = [] } = useTransactions();
  // Sumber transaksi: Supabase bila terhubung, jika tidak riwayat lokal.
  // Ditampilkan di depan, disusul data contoh.
  const source = isSupabaseConfigured ? dbTransactions : recorded;
  const allTrx = useMemo(() => [...source, ...ALL_TRX], [source]);

  const data = periodData[period];

  const catBreakdown = useMemo(() => {
    const totals = {
      sayur: sum(data.sayur),
      buah: sum(data.buah),
      sembako: sum(data.sembako),
      frozen: sum(data.frozen),
    };
    const grand = totals.sayur + totals.buah + totals.sembako + totals.frozen || 1;
    return [
      { label: 'Sayur', color: categoryColors.sayur, value: totals.sayur },
      { label: 'Buah', color: categoryColors.buah, value: totals.buah },
      { label: 'Sembako', color: categoryColors.sembako, value: totals.sembako },
      { label: 'Frozen Food', color: categoryColors.frozen, value: totals.frozen },
    ].map((c) => ({ ...c, pct: Math.round((c.value / grand) * 100) }));
  }, [data]);

  const filteredTrx = useMemo(() => {
    const q = search.toLowerCase();
    return allTrx.filter(
      (t) => t.id.toLowerCase().includes(q) || t.cashier.toLowerCase().includes(q),
    );
  }, [search, allTrx]);

  const pages = Math.max(1, Math.ceil(filteredTrx.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const pageSlice = filteredTrx.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const kpis = [
    { label: 'Total Penjualan', value: data.kpiTotal, badge: data.badgeTotal, up: true, featured: true },
    { label: 'Transaksi', value: String(data.kpiTrx), badge: data.badgeTrx, up: true },
    { label: 'Rata-rata Transaksi', value: data.kpiAvg, badge: data.badgeAvg, up: !data.badgeAvg.startsWith('▼') },
    { label: 'Item Terjual', value: String(data.kpiItems), badge: data.badgeItems, up: true },
  ];

  return (
    <AppShell
      headerCenter={
        <View>
          <Text style={styles.headerTitle}>Laporan Penjualan</Text>
          <Text style={styles.headerSub}>{data.range}</Text>
        </View>
      }
      headerRight={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={styles.exportBtn}>
            <Text style={styles.exportText}>⬇ Export CSV</Text>
          </Pressable>
          <Pressable style={[styles.exportBtn, styles.exportPrimary]}>
            <Text style={[styles.exportText, { color: palette.white }]}>🖨 Cetak PDF</Text>
          </Pressable>
        </View>
      }
    >
      {/* FILTER BAR */}
      <Card style={{ padding: 12 }}>
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>PERIODE</Text>
          <View style={styles.periodTabs}>
            {PERIOD_TABS.map((t) => {
              const active = period === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => { setPeriod(t.key); setPage(1); }}
                  style={[styles.periodTab, active && styles.periodTabActive]}
                >
                  <Text style={[styles.periodTabText, active && { color: palette.white }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.catFilter}>
            {CAT_PILLS.map((c) => {
              const active = catFilter === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCatFilter(c)}
                  style={[styles.catPill, active && styles.catPillActive]}
                >
                  <Text style={[styles.catPillText, active && { color: palette.g700 }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      {/* KPI ROW */}
      <View style={styles.kpiRow}>
        {kpis.map((k) => (
          <View key={k.label} style={[styles.kpiCard, k.featured && styles.kpiFeatured]}>
            <Text style={[styles.kpiEyebrow, k.featured && { color: palette.g100 }]}>{k.label.toUpperCase()}</Text>
            <Text style={[styles.kpiVal, k.featured && { color: palette.white }]}>{k.value}</Text>
            <View style={styles.kpiMetaRow}>
              <View style={[styles.kpiBadge, { backgroundColor: k.up ? '#E8F5EE' : palette.coralLight }]}>
                <Text style={[styles.kpiBadgeText, { color: k.up ? '#1A8048' : palette.coral }]}>{k.badge}</Text>
              </View>
              <Text style={[styles.kpiMeta, k.featured && { color: palette.g100 }]}>vs periode lalu</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CHARTS ROW */}
      <View style={styles.chartsRow}>
        <Card style={styles.flex2}>
          <CardHeader
            title="Tren Penjualan"
            subtitle={data.sub}
            right={
              <View style={styles.toggle}>
                {(['bar', 'line'] as const).map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => setChartView(v)}
                    style={[styles.toggleBtn, chartView === v && styles.toggleBtnActive]}
                  >
                    <Text style={[styles.toggleText, chartView === v && { color: palette.text }]}>
                      {v === 'bar' ? 'Bar' : 'Line'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          />
          {chartView === 'bar' ? (
            <StackedBarChart
              labels={data.labels}
              series={[
                { label: 'Sayur', data: data.sayur, color: categoryColors.sayur },
                { label: 'Buah', data: data.buah, color: categoryColors.buah },
                { label: 'Sembako', data: data.sembako, color: categoryColors.sembako },
                { label: 'Frozen', data: data.frozen, color: categoryColors.frozen },
              ]}
              height={190}
            />
          ) : (
            <View style={styles.linePlaceholder}>
              <Text style={{ color: palette.muted, fontSize: 13 }}>
                Tampilan grafik garis menyusul (gunakan react-native-svg / Victory Native).
              </Text>
            </View>
          )}
        </Card>

        <Card style={styles.flex1}>
          <CardHeader title="Per Kategori" subtitle={data.catLabel} />
          <View style={{ gap: 8 }}>
            {catBreakdown.map((c) => (
              <View key={c.label} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: c.color }]} />
                <Text style={styles.catName}>{c.label}</Text>
                <View style={styles.catBarTrack}>
                  <View style={[styles.catBarFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
                </View>
                <Text style={styles.catPct}>{c.pct}%</Text>
                <Text style={styles.catOmset}>{formatShort(c.value * 1000)}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* TRANSACTION TABLE */}
      <Card style={{ padding: 0 }}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Riwayat Transaksi</Text>
          <View style={{ flex: 1 }} />
          <TextInput
            style={styles.tableSearch}
            value={search}
            onChangeText={(v) => { setSearch(v); setPage(1); }}
            placeholder="🔍 Cari ID atau kasir…"
            placeholderTextColor={palette.muted}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tr, { backgroundColor: palette.cream }]}>
              {['ID Transaksi', 'Waktu', 'Kasir', 'Item', 'Kategori', 'Subtotal', 'Diskon', 'Total', 'Bayar', 'Status'].map(
                (h, i) => (
                  <Text key={h} style={[styles.th, COLS[i]]}>{h}</Text>
                ),
              )}
            </View>
            {pageSlice.map((t) => (
              <TableRow key={t.id} tx={t} />
            ))}
          </View>
        </ScrollView>
        <View style={styles.tableFooter}>
          <Text style={styles.footerInfo}>
            Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filteredTrx.length)} dari {filteredTrx.length} transaksi
          </Text>
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 6).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPage(p)}
                style={[styles.pgBtn, p === currentPage && styles.pgBtnActive]}
              >
                <Text style={[styles.pgText, p === currentPage && { color: palette.white }]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>
    </AppShell>
  );
}

function TableRow({ tx }: { tx: Transaction }) {
  const method =
    tx.method === 'tunai'
      ? { bg: palette.g50, fg: palette.g700, label: 'Tunai' }
      : tx.method === 'qris'
        ? { bg: palette.skyLight, fg: palette.sky, label: 'QRIS' }
        : { bg: palette.amberLight, fg: '#9B6900', label: 'Transfer' };
  const done = tx.status === 'Selesai';
  return (
    <View style={styles.tr}>
      <Text style={[styles.td, COLS[0], { color: palette.g700, fontWeight: '600' }]}>{tx.id}</Text>
      <Text style={[styles.td, COLS[1], { color: palette.muted }]}>{tx.time}</Text>
      <Text style={[styles.td, COLS[2]]}>{tx.cashier}</Text>
      <Text style={[styles.td, COLS[3], { textAlign: 'center' }]}>{tx.items}</Text>
      <Text style={[styles.td, COLS[4]]}>{tx.category}</Text>
      <Text style={[styles.td, COLS[5]]}>{formatRupiah(tx.subtotal)}</Text>
      <Text style={[styles.td, COLS[6], { color: palette.coral }]}>
        {tx.discount > 0 ? '-' + formatRupiah(tx.discount) : '—'}
      </Text>
      <Text style={[styles.td, COLS[7], { color: palette.g700, fontWeight: '700' }]}>{formatRupiah(tx.total)}</Text>
      <View style={[styles.td, COLS[8]]}>
        <View style={[styles.badge, { backgroundColor: method.bg }]}>
          <Text style={[styles.badgeText, { color: method.fg }]}>{method.label}</Text>
        </View>
      </View>
      <View style={[styles.td, COLS[9]]}>
        <View style={[styles.badge, { backgroundColor: done ? '#E8F5EE' : palette.coralLight }]}>
          <Text style={[styles.badgeText, { color: done ? '#1A8048' : palette.coral }]}>
            {done ? '✓ Selesai' : '✗ Batal'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

const COLS = [
  { width: 110 }, // id
  { width: 64 }, // waktu
  { width: 84 }, // kasir
  { width: 54 }, // item
  { width: 96 }, // kategori
  { width: 110 }, // subtotal
  { width: 96 }, // diskon
  { width: 110 }, // total
  { width: 88 }, // bayar
  { width: 96 }, // status
];

const styles = StyleSheet.create({
  headerTitle: { fontWeight: '700', fontSize: 15, color: palette.text },
  headerSub: { fontSize: 11, color: palette.muted },
  exportBtn: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm + 1,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.white,
  },
  exportPrimary: { backgroundColor: palette.g900, borderColor: palette.g900 },
  exportText: { fontSize: 12, fontWeight: '600', color: palette.text },

  // filter
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  filterLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: palette.muted },
  periodTabs: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 2,
  },
  periodTab: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  periodTabActive: { backgroundColor: palette.g900 },
  periodTabText: { fontSize: 12, fontWeight: '600', color: palette.muted },
  catFilter: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.white,
  },
  catPillActive: { borderColor: palette.g700, backgroundColor: palette.g50 },
  catPillText: { fontSize: 11, fontWeight: '600', color: palette.muted },

  // kpi
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 160,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  kpiFeatured: { backgroundColor: palette.g900, borderColor: palette.g900 },
  kpiEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: palette.muted },
  kpiVal: { fontWeight: '800', fontSize: 22, color: palette.text },
  kpiMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpiBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  kpiBadgeText: { fontSize: 10, fontWeight: '700' },
  kpiMeta: { fontSize: 11, color: palette.muted },

  // charts
  chartsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flex1: { flexGrow: 1, flexBasis: 280, minWidth: 280 },
  flex2: { flexGrow: 2, flexBasis: 380, minWidth: 320 },
  toggle: { flexDirection: 'row', gap: 3, backgroundColor: palette.cream, borderWidth: 1, borderColor: palette.border, borderRadius: 7, padding: 2 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 5 },
  toggleBtnActive: { backgroundColor: palette.white },
  toggleText: { fontSize: 11, fontWeight: '600', color: palette.muted },
  linePlaceholder: { height: 190, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 3 },
  catName: { fontSize: 12, fontWeight: '500', color: palette.text, flex: 1 },
  catBarTrack: { flex: 1.6, height: 6, backgroundColor: palette.cream, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: 6, borderRadius: 3 },
  catPct: { fontSize: 11, fontWeight: '700', color: palette.text, width: 34, textAlign: 'right' },
  catOmset: { fontSize: 11, color: palette.muted, width: 72, textAlign: 'right' },

  // table
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  tableTitle: { fontWeight: '700', fontSize: 13, color: palette.text },
  tableSearch: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: palette.text,
    minWidth: 180,
    maxWidth: 260,
  },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.border2 },
  th: { fontSize: 10, fontWeight: '700', color: palette.muted, paddingHorizontal: 12, paddingVertical: 9, textTransform: 'uppercase' },
  td: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: palette.text, fontWeight: '500' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  tableFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  footerInfo: { fontSize: 11, color: palette.muted },
  pgBtn: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 7,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pgBtnActive: { backgroundColor: palette.g900, borderColor: palette.g900 },
  pgText: { fontSize: 13, fontWeight: '600', color: palette.muted },
});
