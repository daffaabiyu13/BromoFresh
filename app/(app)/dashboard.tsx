import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { Card, CardHeader } from '@/components/Card';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { categoryColors, palette, radius, spacing } from '@/constants/theme';
import {
  categoryContribution,
  dashboardKpis,
  recentTransactions,
  stockAlerts,
  topProducts,
  weeklySales,
  type Kpi,
} from '@/data/mockDashboard';
import { formatRupiah } from '@/utils/format';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTransactions } from '@/lib/queries';
import { useTransactionStore } from '@/store/useTransactionStore';
import type { Transaction } from '@/types';

const PERIODS = ['Hari', 'Minggu', 'Bulan', 'Tahun'] as const;

export default function DashboardScreen() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Minggu');
  const recorded = useTransactionStore((s) => s.transactions);
  const { data: dbTransactions = [] } = useTransactions();
  // Sumber transaksi: Supabase bila terhubung, jika tidak riwayat lokal.
  // Dilengkapi data contoh hingga 5 baris.
  const source = isSupabaseConfigured ? dbTransactions : recorded;
  const latestTransactions = [...source, ...recentTransactions].slice(0, 5);

  return (
    <AppShell
      headerCenter={
        <View style={styles.periodWrap}>
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>
      }
      headerRight={
        <Pressable style={styles.exportBtn}>
          <Text style={styles.exportText}>⬇ Export</Text>
        </Pressable>
      }
    >
      {/* KPI ROW */}
      <View style={styles.kpiRow}>
        {dashboardKpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </View>

      {/* CHARTS ROW */}
      <View style={styles.chartsRow}>
        <Card style={styles.flex2}>
          <CardHeader title="Statistik Penjualan" subtitle="Omset per kategori 7 hari terakhir" />
          <StackedBarChart
            labels={weeklySales.labels}
            series={[
              { label: 'Sayur', data: weeklySales.sayur, color: categoryColors.sayur },
              { label: 'Buah', data: weeklySales.buah, color: categoryColors.buah },
              { label: 'Sembako', data: weeklySales.sembako, color: categoryColors.sembako },
              { label: 'Frozen', data: weeklySales.frozen, color: categoryColors.frozen },
            ]}
          />
        </Card>

        <Card style={styles.flex1}>
          <CardHeader title="Per Kategori" subtitle="Kontribusi omset hari ini" />
          <View style={styles.donutWrap}>
            <DonutChart data={categoryContribution.map((c) => ({ value: c.pct, color: c.color }))} />
            <View style={styles.donutCenter} pointerEvents="none">
              <Text style={styles.donutVal}>100%</Text>
              <Text style={styles.donutLabel}>Total Hari Ini</Text>
            </View>
          </View>
          <View style={{ gap: 7 }}>
            {categoryContribution.map((c) => (
              <View key={c.key} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                <Text style={styles.legendName}>{c.label}</Text>
                <View style={styles.legendBarTrack}>
                  <View style={[styles.legendBarFill, { width: `${c.pct}%`, backgroundColor: c.color }]} />
                </View>
                <Text style={styles.legendPct}>{c.pct}%</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* MIDDLE ROW */}
      <View style={styles.chartsRow}>
        <Card style={styles.flex1}>
          <CardHeader title="Produk Terlaris" subtitle="Top 5 hari ini berdasarkan omset" />
          <View style={{ gap: 8 }}>
            {topProducts.map((p) => (
              <View key={p.rank} style={styles.rankItem}>
                <Text style={styles.rankNum}>{String(p.rank).padStart(2, '0')}</Text>
                <Text style={styles.rankEmoji}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.rankQty}>{p.qty}</Text>
                </View>
                <Text style={styles.rankVal}>{p.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card style={styles.flex1}>
          <CardHeader title="Peringatan Stok" subtitle="4 produk perlu perhatian" />
          <View style={{ gap: 8 }}>
            {stockAlerts.map((a) => {
              const critical = a.level === 'critical';
              return (
                <View
                  key={a.name}
                  style={[
                    styles.alertItem,
                    {
                      backgroundColor: critical ? palette.coralLight : palette.amberLight,
                      borderColor: critical ? '#F4C4BF' : '#F4DCA0',
                    },
                  ]}
                >
                  <Text style={styles.alertEmoji}>{a.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertName}>{a.name}</Text>
                    <Text style={[styles.alertDetail, { color: critical ? palette.coral : palette.amber }]}>
                      {a.remaining} · {a.min}
                    </Text>
                  </View>
                  <Pressable style={[styles.restockBtn, { backgroundColor: critical ? palette.coral : palette.amber }]}>
                    <Text style={styles.restockText}>Restock</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* TRANSACTIONS TABLE */}
      <Card>
        <CardHeader title="Transaksi Terbaru" subtitle="5 transaksi terakhir hari ini" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tr, styles.thead]}>
              <Text style={[styles.th, styles.cId]}>No. Struk</Text>
              <Text style={[styles.th, styles.cTime]}>Waktu</Text>
              <Text style={[styles.th, styles.cCashier]}>Kasir</Text>
              <Text style={[styles.th, styles.cItems]}>Produk</Text>
              <Text style={[styles.th, styles.cTotal]}>Total</Text>
              <Text style={[styles.th, styles.cMethod]}>Metode</Text>
            </View>
            {latestTransactions.map((t) => (
              <TxRow key={t.id} tx={t} />
            ))}
          </View>
        </ScrollView>
      </Card>
    </AppShell>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const featured = kpi.featured;
  const dirColor =
    kpi.changeDir === 'up' ? palette.g700 : kpi.changeDir === 'down' ? palette.coral : palette.amber;
  const dirBg =
    kpi.changeDir === 'up' ? palette.g50 : kpi.changeDir === 'down' ? palette.coralLight : palette.amberLight;

  return (
    <View style={[styles.kpiCard, featured && styles.kpiFeatured]}>
      <View style={styles.kpiEyebrowRow}>
        <Text style={[styles.kpiEyebrow, featured && { color: 'rgba(255,255,255,0.7)' }]}>{kpi.label}</Text>
        <Text style={styles.kpiIcon}>{kpi.icon}</Text>
      </View>
      <Text style={[styles.kpiVal, featured && { color: palette.white }, kpi.danger && { color: palette.coral }]}>
        {kpi.value}
      </Text>
      <View style={styles.kpiSub}>
        {kpi.change ? (
          <View style={[styles.kpiChange, { backgroundColor: featured ? 'rgba(255,255,255,0.2)' : dirBg }]}>
            <Text style={[styles.kpiChangeText, { color: featured ? palette.white : dirColor }]}>{kpi.change}</Text>
          </View>
        ) : null}
        <Text style={[styles.kpiCompare, featured && { color: 'rgba(255,255,255,0.6)' }]}>{kpi.compare}</Text>
      </View>
    </View>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const methodStyle =
    tx.method === 'tunai'
      ? { bg: palette.g50, fg: palette.g700, label: 'Tunai' }
      : tx.method === 'qris'
        ? { bg: palette.skyLight, fg: palette.sky, label: 'QRIS' }
        : { bg: palette.amberLight, fg: palette.amber, label: 'Transfer' };
  return (
    <View style={styles.tr}>
      <Text style={[styles.td, styles.cId, { color: palette.g700, fontWeight: '600' }]}>{tx.id}</Text>
      <Text style={[styles.td, styles.cTime, { color: palette.muted }]}>{tx.time}</Text>
      <Text style={[styles.td, styles.cCashier]}>{tx.cashier}</Text>
      <Text style={[styles.td, styles.cItems, { color: palette.muted }]} numberOfLines={1}>
        {tx.items} item · {tx.category}
      </Text>
      <Text style={[styles.td, styles.cTotal, { fontWeight: '700' }]}>{formatRupiah(tx.total)}</Text>
      <View style={[styles.td, styles.cMethod]}>
        <View style={[styles.methodBadge, { backgroundColor: methodStyle.bg }]}>
          <Text style={[styles.methodText, { color: methodStyle.fg }]}>{methodStyle.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // top bar controls
  periodWrap: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: 3,
  },
  periodBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 7 },
  periodBtnActive: { backgroundColor: palette.g900 },
  periodText: { fontSize: 12, fontWeight: '600', color: palette.muted },
  periodTextActive: { color: palette.white },
  exportBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.sm + 1,
    backgroundColor: palette.white,
  },
  exportText: { fontSize: 13, fontWeight: '600', color: palette.text },

  // kpi
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: {
    flexGrow: 1,
    flexBasis: 150,
    minWidth: 150,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  kpiFeatured: { backgroundColor: palette.g900, borderColor: palette.g900 },
  kpiEyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kpiEyebrow: { fontSize: 11, fontWeight: '600', color: palette.muted },
  kpiIcon: { fontSize: 15 },
  kpiVal: { fontWeight: '800', fontSize: 20, color: palette.text, marginTop: 2 },
  kpiSub: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  kpiChange: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  kpiChangeText: { fontSize: 11, fontWeight: '700' },
  kpiCompare: { fontSize: 11, color: palette.muted },

  // layout
  chartsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flex1: { flexGrow: 1, flexBasis: 280, minWidth: 280 },
  flex2: { flexGrow: 2, flexBasis: 380, minWidth: 320 },

  // donut
  donutWrap: { height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  donutCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  donutVal: { fontWeight: '800', fontSize: 20, color: palette.text },
  donutLabel: { fontSize: 10, color: palette.muted },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 9, height: 9, borderRadius: 4.5 },
  legendName: { flex: 1, fontSize: 12, color: palette.text, fontWeight: '500' },
  legendBarTrack: { flex: 1.4, height: 4, backgroundColor: palette.border2, borderRadius: 2, overflow: 'hidden' },
  legendBarFill: { height: 4, borderRadius: 2 },
  legendPct: { fontWeight: '700', fontSize: 11, color: palette.text, width: 34, textAlign: 'right' },

  // rank
  rankItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.cream, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 8 },
  rankNum: { fontWeight: '800', fontSize: 12, color: palette.muted, minWidth: 18 },
  rankEmoji: { fontSize: 20, width: 32, textAlign: 'center' },
  rankName: { fontSize: 13, fontWeight: '600', color: palette.text },
  rankQty: { fontSize: 11, color: palette.muted },
  rankVal: { fontWeight: '700', fontSize: 12, color: palette.text },

  // alerts
  alertItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5 },
  alertEmoji: { fontSize: 20, width: 28, textAlign: 'center' },
  alertName: { fontSize: 13, fontWeight: '600', color: palette.text },
  alertDetail: { fontSize: 11, marginTop: 1 },
  restockBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7 },
  restockText: { color: palette.white, fontSize: 11, fontWeight: '700' },

  // table
  thead: { backgroundColor: palette.cream },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.border2 },
  th: { fontSize: 10, fontWeight: '700', color: palette.muted, paddingHorizontal: 12, paddingVertical: 8, textTransform: 'uppercase' },
  td: { paddingHorizontal: 12, paddingVertical: 10, color: palette.text, fontSize: 13 },
  cId: { width: 90 },
  cTime: { width: 70 },
  cCashier: { width: 90 },
  cItems: { width: 160 },
  cTotal: { width: 110 },
  cMethod: { width: 100 },
  methodBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  methodText: { fontSize: 10, fontWeight: '700' },
});
