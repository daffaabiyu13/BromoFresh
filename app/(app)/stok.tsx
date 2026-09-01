import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { Card } from '@/components/Card';
import { categoryColors, palette, radius, spacing } from '@/constants/theme';
import type { StockRow, StockStatus } from '@/data/mockStock';
import { useStockAdjust, useStockProducts } from '@/lib/queries';
import { formatRupiah } from '@/utils/format';
import type { CategoryKey } from '@/types';

type Filter = CategoryKey | 'all' | 'kritis';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'sayur', label: '🥬 Sayur' },
  { key: 'buah', label: '🍊 Buah' },
  { key: 'sembako', label: '🛒 Sembako' },
  { key: 'frozen', label: '❄️ Frozen' },
  { key: 'kritis', label: '⚠ Stok Kritis' },
];

const STATUS_STYLE: Record<StockStatus, { bg: string; fg: string; label: string }> = {
  kritis: { bg: palette.coralLight, fg: palette.coral, label: 'Kritis' },
  menipis: { bg: palette.amberLight, fg: palette.amber, label: 'Menipis' },
  aman: { bg: palette.g50, fg: palette.g700, label: 'Aman' },
};

export default function StokScreen() {
  // Data stok dari Supabase (atau mock bila belum dikonfigurasi).
  const { data: rows = [] } = useStockProducts();
  const adjust = useStockAdjust();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const summary = useMemo(() => {
    return {
      total: rows.length,
      aman: rows.filter((r) => r.status === 'aman').length,
      menipis: rows.filter((r) => r.status === 'menipis').length,
      kritis: rows.filter((r) => r.status === 'kritis').length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) => {
      const matchFilter =
        filter === 'all' ? true : filter === 'kritis' ? r.status === 'kritis' : r.category === filter;
      return matchFilter && r.name.toLowerCase().includes(q);
    });
  }, [rows, filter, search]);

  return (
    <AppShell
      headerCenter={
        <View>
          <Text style={styles.headerTitle}>Manajemen Stok</Text>
          <Text style={styles.headerSub}>Inventory real-time per kategori</Text>
        </View>
      }
    >
      {/* SUMMARY */}
      <View style={styles.summaryRow}>
        <SummaryCard label="Total Produk" value={summary.total} icon="📦" />
        <SummaryCard label="Stok Aman" value={summary.aman} icon="✅" color={palette.g700} />
        <SummaryCard label="Menipis" value={summary.menipis} icon="🔸" color={palette.amber} />
        <SummaryCard label="Kritis" value={summary.kritis} icon="⚠️" color={palette.coral} />
      </View>

      {/* FILTER + SEARCH */}
      <Card style={{ padding: 12 }}>
        <View style={styles.filterBar}>
          <View style={styles.pills}>
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && { color: palette.g700 }]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flex: 1 }} />
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="🔍 Cari produk…"
            placeholderTextColor={palette.muted}
          />
        </View>
      </Card>

      {/* TABLE */}
      <Card style={{ padding: 0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.tr, { backgroundColor: palette.cream }]}>
              <Text style={[styles.th, C.produk]}>Produk</Text>
              <Text style={[styles.th, C.kategori]}>Kategori</Text>
              <Text style={[styles.th, C.stok]}>Stok</Text>
              <Text style={[styles.th, C.min]}>Min</Text>
              <Text style={[styles.th, C.hpp]}>HPP</Text>
              <Text style={[styles.th, C.status]}>Status</Text>
              <Text style={[styles.th, C.aksi]}>Aksi</Text>
            </View>
            {filtered.map((row) => (
              <StockTableRow
                key={row.id}
                row={row}
                onAdjust={(delta) =>
                  adjust.mutate({ id: row.id, uuid: row.uuid, delta, currentStock: row.stock })
                }
              />
            ))}
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ color: palette.muted }}>Tidak ada produk yang cocok.</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Menampilkan {filtered.length} dari {rows.length} produk · gunakan − / + untuk
            menyesuaikan stok
          </Text>
        </View>
      </Card>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color = palette.text,
}: {
  label: string;
  value: number;
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

function StockTableRow({ row, onAdjust }: { row: StockRow; onAdjust: (delta: number) => void }) {
  const s = STATUS_STYLE[row.status];
  const catColor = categoryColors[row.category];
  return (
    <View style={styles.tr}>
      <View style={[styles.td, C.produk, styles.produkCell]}>
        <View style={[styles.emojiBox, { backgroundColor: row.bg }]}>
          <Text style={{ fontSize: 18 }}>{row.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.produkName} numberOfLines={1}>{row.name}</Text>
          <Text style={styles.produkPrice}>{formatRupiah(row.price)} /{row.unit}</Text>
        </View>
      </View>
      <View style={[styles.td, C.kategori, styles.catCell]}>
        <View style={[styles.catDot, { backgroundColor: catColor }]} />
        <Text style={styles.catText}>{row.category}</Text>
      </View>
      <Text style={[styles.td, C.stok, styles.stokNum, row.status === 'kritis' && { color: palette.coral }]}>
        {row.stock} {row.unit}
      </Text>
      <Text style={[styles.td, C.min, { color: palette.muted }]}>{row.minStock}</Text>
      <Text style={[styles.td, C.hpp, { color: palette.muted }]}>{formatRupiah(row.costPrice)}</Text>
      <View style={[styles.td, C.status]}>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.fg }]}>{s.label}</Text>
        </View>
      </View>
      <View style={[styles.td, C.aksi, styles.aksiCell]}>
        <Pressable
          style={[styles.stepBtn, row.stock <= 0 && styles.stepBtnDisabled]}
          onPress={() => onAdjust(-1)}
          disabled={row.stock <= 0}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <Pressable style={styles.stepBtn} onPress={() => onAdjust(1)}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const C = {
  produk: { width: 210 },
  kategori: { width: 110 },
  stok: { width: 90 },
  min: { width: 60 },
  hpp: { width: 110 },
  status: { width: 90 },
  aksi: { width: 110 },
} as const;

const styles = StyleSheet.create({
  headerTitle: { fontWeight: '700', fontSize: 15, color: palette.text },
  headerSub: { fontSize: 11, color: palette.muted },

  // summary
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryCard: {
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
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: palette.muted },
  summaryIcon: { fontSize: 15 },
  summaryValue: { fontWeight: '800', fontSize: 22, marginTop: 2 },

  // filter
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  pills: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.white,
  },
  pillActive: { borderColor: palette.g700, backgroundColor: palette.g50 },
  pillText: { fontSize: 11, fontWeight: '600', color: palette.muted },
  search: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: palette.text,
    minWidth: 180,
    maxWidth: 240,
  },

  // table
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: palette.border2, alignItems: 'center' },
  th: { fontSize: 10, fontWeight: '700', color: palette.muted, paddingHorizontal: 12, paddingVertical: 9, textTransform: 'uppercase' },
  td: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 12.5, color: palette.text },
  produkCell: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  emojiBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  produkName: { fontSize: 13, fontWeight: '600', color: palette.text },
  produkPrice: { fontSize: 11, color: palette.muted, marginTop: 1 },
  catCell: { flexDirection: 'row', alignItems: 'center' },
  catDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  catText: { fontSize: 12, color: palette.text, textTransform: 'capitalize' },
  stokNum: { fontWeight: '700' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  aksiCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.g900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { backgroundColor: '#B0C4BA' },
  stepText: { color: palette.white, fontSize: 18, fontWeight: '700', lineHeight: 20 },
  empty: { padding: 24, alignItems: 'center' },
  footer: { paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1, borderTopColor: palette.border },
  footerText: { fontSize: 11, color: palette.muted },
});
