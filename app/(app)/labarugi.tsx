import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { Card, CardHeader } from '@/components/Card';
import { StackedBarChart } from '@/components/charts/StackedBarChart';
import { palette, radius, spacing } from '@/constants/theme';
import type { ReportPeriod } from '@/data/mockReports';
import { netProfitTrend, profitLossData } from '@/data/mockProfitLoss';
import { useExpenseStore } from '@/store/useExpenseStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatRupiah, formatShort } from '@/utils/format';

const PERIOD_TABS: { key: ReportPeriod; label: string }[] = [
  { key: 'harian', label: 'Harian' },
  { key: 'mingguan', label: 'Mingguan' },
  { key: 'bulanan', label: 'Bulanan' },
  { key: 'tahunan', label: 'Tahunan' },
];

export default function LabaRugiScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const [period, setPeriod] = useState<ReportPeriod>('bulanan');

  const expenses = useExpenseStore((s) => s.expenses);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const removeExpense = useExpenseStore((s) => s.removeExpense);

  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const pl = profitLossData[period];
  const opex = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const grossProfit = pl.revenue - pl.cogs;
  const netProfit = grossProfit - opex;
  const grossMargin = pl.revenue > 0 ? (grossProfit / pl.revenue) * 100 : 0;
  const netMargin = pl.revenue > 0 ? (netProfit / pl.revenue) * 100 : 0;

  function handleAdd() {
    const amount = Number(newAmount.replace(/[^0-9]/g, ''));
    if (!amount) return;
    addExpense(newLabel, amount);
    setNewLabel('');
    setNewAmount('');
  }

  // Akses modul ini khusus Owner (PRD §03 matriks akses).
  if (role && role !== 'owner') {
    return (
      <AppShell headerCenter={<Text style={styles.headerTitle}>Laba Rugi</Text>}>
        <Card>
          <Text style={styles.restrictedTitle}>🔒 Akses Terbatas</Text>
          <Text style={styles.restrictedText}>
            Modul Laba Rugi hanya dapat diakses oleh Owner. Silakan hubungi pemilik toko.
          </Text>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerCenter={
        <View>
          <Text style={styles.headerTitle}>Laba Rugi</Text>
          <Text style={styles.headerSub}>{pl.range}</Text>
        </View>
      }
      headerRight={
        <Pressable style={styles.exportBtn}>
          <Text style={styles.exportText}>🖨 Cetak PDF</Text>
        </Pressable>
      }
    >
      {/* PERIOD FILTER */}
      <Card style={{ padding: 12 }}>
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>PERIODE</Text>
          <View style={styles.periodTabs}>
            {PERIOD_TABS.map((t) => {
              const active = period === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setPeriod(t.key)}
                  style={[styles.periodTab, active && styles.periodTabActive]}
                >
                  <Text style={[styles.periodTabText, active && { color: palette.white }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      {/* KPI ROW */}
      <View style={styles.kpiRow}>
        <Kpi label="Pendapatan" value={formatShort(pl.revenue)} />
        <Kpi label="HPP" value={formatShort(pl.cogs)} color={palette.coral} />
        <Kpi label="Laba Kotor" value={formatShort(grossProfit)} sub={`Margin ${grossMargin.toFixed(1)}%`} featured />
        <Kpi label="Laba Bersih" value={formatShort(netProfit)} sub={`Margin ${netMargin.toFixed(1)}%`} color={netProfit >= 0 ? palette.g700 : palette.coral} />
      </View>

      <View style={styles.row}>
        {/* P&L STATEMENT */}
        <Card style={styles.flex1}>
          <CardHeader title="Laporan Laba Rugi" subtitle={pl.sub} />
          <PLRow label="Pendapatan" value={pl.revenue} />
          <PLRow label="HPP (Harga Pokok Penjualan)" value={-pl.cogs} muted />
          <View style={styles.plDivider} />
          <PLRow label="Laba Kotor" value={grossProfit} bold badge={`${grossMargin.toFixed(1)}%`} />
          <PLRow label="Biaya Operasional" value={-opex} muted />
          <View style={styles.plDivider} />
          <PLRow label="Laba Bersih" value={netProfit} strong badge={`${netMargin.toFixed(1)}%`} />
        </Card>

        {/* NET PROFIT TREND */}
        <Card style={styles.flex1}>
          <CardHeader title="Tren Laba Bersih" subtitle="Per bulan (Jan–Agt 2026)" />
          <StackedBarChart
            labels={netProfitTrend.labels}
            series={[{ label: 'Laba Bersih (rb)', data: netProfitTrend.values, color: palette.g700 }]}
            height={190}
          />
        </Card>
      </View>

      <View style={styles.row}>
        {/* CATEGORY MARGIN */}
        <Card style={styles.flex1}>
          <CardHeader title="Margin per Kategori" subtitle={pl.range} />
          <View style={{ gap: 10 }}>
            {pl.categoryMargin.map((c) => {
              const profit = c.revenue - c.cogs;
              const margin = c.revenue > 0 ? (profit / c.revenue) * 100 : 0;
              return (
                <View key={c.label} style={styles.marginRow}>
                  <View style={[styles.catDot, { backgroundColor: c.color }]} />
                  <Text style={styles.marginName}>{c.label}</Text>
                  <View style={styles.marginBarTrack}>
                    <View style={[styles.marginBarFill, { width: `${Math.min(margin, 100)}%`, backgroundColor: c.color }]} />
                  </View>
                  <Text style={styles.marginPct}>{margin.toFixed(0)}%</Text>
                  <Text style={styles.marginVal}>{formatShort(profit)}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* OPERATIONAL EXPENSES */}
        <Card style={styles.flex1}>
          <CardHeader title="Biaya Operasional" subtitle={`Total ${formatRupiah(opex)}`} />
          <View style={{ gap: 6 }}>
            {expenses.map((e) => (
              <View key={e.id} style={styles.expenseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseLabel}>{e.label}</Text>
                  <Text style={styles.expenseCat}>{e.category}</Text>
                </View>
                <Text style={styles.expenseAmount}>{formatRupiah(e.amount)}</Text>
                <Pressable onPress={() => removeExpense(e.id)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>

          {/* Add expense */}
          <View style={styles.addRow}>
            <TextInput
              style={[styles.addInput, { flex: 2 }]}
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="Nama biaya"
              placeholderTextColor={palette.muted}
            />
            <TextInput
              style={[styles.addInput, { flex: 1 }]}
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="Jumlah"
              placeholderTextColor={palette.muted}
              keyboardType="numeric"
              inputMode="numeric"
            />
            <Pressable style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>+ Tambah</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </AppShell>
  );
}

function Kpi({
  label,
  value,
  sub,
  color = palette.text,
  featured,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  featured?: boolean;
}) {
  return (
    <View style={[styles.kpiCard, featured && styles.kpiFeatured]}>
      <Text style={[styles.kpiLabel, featured && { color: palette.g100 }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.kpiValue, featured ? { color: palette.white } : { color }]}>{value}</Text>
      {sub ? <Text style={[styles.kpiSub, featured && { color: palette.g100 }]}>{sub}</Text> : null}
    </View>
  );
}

function PLRow({
  label,
  value,
  muted,
  bold,
  strong,
  badge,
}: {
  label: string;
  value: number;
  muted?: boolean;
  bold?: boolean;
  strong?: boolean;
  badge?: string;
}) {
  const negative = value < 0;
  return (
    <View style={styles.plRow}>
      <Text
        style={[
          styles.plLabel,
          muted && { color: palette.muted },
          (bold || strong) && { fontWeight: '700', color: palette.text },
        ]}
      >
        {label}
      </Text>
      {badge ? (
        <View style={styles.plBadge}>
          <Text style={styles.plBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text
        style={[
          styles.plValue,
          negative && { color: palette.coral },
          strong && { fontWeight: '800', fontSize: 15, color: value >= 0 ? palette.g700 : palette.coral },
          bold && { fontWeight: '700' },
        ]}
      >
        {negative ? '− ' : ''}
        {formatRupiah(Math.abs(value))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontWeight: '700', fontSize: 15, color: palette.text },
  headerSub: { fontSize: 11, color: palette.muted },
  exportBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm + 1,
    borderWidth: 1.5,
    borderColor: palette.g900,
    backgroundColor: palette.g900,
  },
  exportText: { fontSize: 12, fontWeight: '600', color: palette.white },

  restrictedTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 6 },
  restrictedText: { fontSize: 13, color: palette.muted, lineHeight: 19 },

  // filter
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  kpiLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: palette.muted },
  kpiValue: { fontWeight: '800', fontSize: 20 },
  kpiSub: { fontSize: 11, color: palette.muted },

  // layout
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  flex1: { flexGrow: 1, flexBasis: 300, minWidth: 300 },

  // P&L statement
  plRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  plLabel: { flex: 1, fontSize: 13, color: palette.text },
  plValue: { fontSize: 13.5, fontWeight: '600', color: palette.text, fontVariant: ['tabular-nums'] },
  plBadge: { backgroundColor: palette.g50, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, marginRight: 10 },
  plBadgeText: { fontSize: 10, fontWeight: '700', color: palette.g700 },
  plDivider: { height: 1, backgroundColor: palette.border },

  // category margin
  marginRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catDot: { width: 10, height: 10, borderRadius: 3 },
  marginName: { fontSize: 12.5, fontWeight: '500', color: palette.text, width: 64 },
  marginBarTrack: { flex: 1, height: 6, backgroundColor: palette.cream, borderRadius: 3, overflow: 'hidden' },
  marginBarFill: { height: 6, borderRadius: 3 },
  marginPct: { fontSize: 11, fontWeight: '700', color: palette.text, width: 36, textAlign: 'right' },
  marginVal: { fontSize: 11, color: palette.muted, width: 72, textAlign: 'right' },

  // expenses
  expenseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.cream, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 8 },
  expenseLabel: { fontSize: 12.5, fontWeight: '600', color: palette.text },
  expenseCat: { fontSize: 10.5, color: palette.muted, marginTop: 1 },
  expenseAmount: { fontSize: 12.5, fontWeight: '700', color: palette.text },
  removeBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: palette.coralLight, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: palette.coral, fontSize: 12, fontWeight: '700' },
  addRow: { flexDirection: 'row', gap: 6, marginTop: 12, alignItems: 'center' },
  addInput: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: palette.text,
    backgroundColor: palette.white,
  },
  addBtn: { backgroundColor: palette.g900, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9 },
  addBtnText: { color: palette.white, fontSize: 12, fontWeight: '700' },
});
