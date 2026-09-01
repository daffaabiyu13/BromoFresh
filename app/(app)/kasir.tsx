import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Brand } from '@/components/Brand';
import { NotifButton } from '@/components/NotifButton';
import { UserPill } from '@/components/UserPill';
import { PressableScale } from '@/components/anim/PressableScale';
import { Reveal } from '@/components/anim/Reveal';
import { useReveal } from '@/components/anim/useReveal';
import { categories } from '@/data/products';
import { palette, radius, spacing } from '@/constants/theme';
import { formatRupiah, formatReceiptNumber, formatTanggalId } from '@/utils/format';
import { deriveCategoryCounts, useProducts, useRecordTransaction } from '@/lib/queries';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import type { CategoryKey, PaymentMethod, Product } from '@/types';

const PAYMENT_TABS: { key: PaymentMethod; label: string }[] = [
  { key: 'tunai', label: 'Tunai' },
  { key: 'qris', label: 'QRIS' },
  { key: 'transfer', label: 'Transfer' },
];

export default function KasirScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [category, setCategory] = useState<CategoryKey>('sayur');
  const [search, setSearch] = useState('');

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const changeQty = useCartStore((s) => s.changeQty);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const customerName = useCartStore((s) => s.customerName);
  const setCustomerName = useCartStore((s) => s.setCustomerName);
  const receiptNumber = useCartStore((s) => s.receiptNumber);
  const txCount = useCartStore((s) => s.txCount);
  const placeOrder = useCartStore((s) => s.placeOrder);
  const record = useTransactionStore((s) => s.record);

  // Data produk dari Supabase (atau mock bila belum dikonfigurasi).
  const { data: allProducts = [], isLoading } = useProducts();
  const recordTx = useRecordTransaction();

  // Jumlah produk per kategori dihitung dari data nyata (bukan angka statis).
  const categoryCounts = useMemo(() => deriveCategoryCounts(allProducts), [allProducts]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allProducts.filter(
      (p) => p.category === category && p.name.toLowerCase().includes(q),
    );
  }, [allProducts, category, search]);

  // toast
  const toastY = useRef(new Animated.Value(-80)).current;
  function showToast() {
    Animated.spring(toastY, { toValue: 0, useNativeDriver: true, friction: 6 }).start();
    setTimeout(() => {
      Animated.timing(toastY, { toValue: -80, duration: 250, useNativeDriver: true }).start();
    }, 2500);
  }

  function handlePlaceOrder() {
    if (items.length === 0) return;
    // Catat ke riwayat lokal (tampil di Dashboard/Laporan) sebelum keranjang dikosongkan.
    record({
      receiptNumber,
      items,
      method: paymentMethod,
      cashier: user?.name ?? 'Kasir',
    });
    // Persist ke Supabase bila terhubung (no-op di mode demo).
    recordTx.mutate({
      receiptNo: formatReceiptNumber(receiptNumber),
      items,
      method: paymentMethod,
      cashierId: user?.id,
    });
    placeOrder();
    showToast();
  }

  const qtyOf = (id: number) => items.find((i) => i.id === id)?.qty ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* TOP BAR */}
      <View style={styles.topbar}>
        <Brand />
        <Text style={styles.date}>{formatTanggalId()}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.txCount}>
          Total: <Text style={{ color: palette.text, fontWeight: '600' }}>{txCount}</Text> Transaksi
        </Text>
        <PressableScale style={styles.laporanBtn} onPress={() => router.push('/laporan')}>
          <Text style={styles.laporanText}>▤ Laporan</Text>
        </PressableScale>
        <NotifButton />
        <UserPill
          name={user?.name ?? 'Kasir'}
          role="Kasir"
          avatar={user?.avatar ?? '👩'}
          onPress={signOut}
        />
      </View>

      <View style={[styles.main, { flexDirection: wide ? 'row' : 'column' }]}>
        {/* LEFT: PRODUCTS */}
        <View style={styles.productPanel}>
          {/* Search */}
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="🔍  Cari produk…"
            placeholderTextColor={palette.muted}
          />

          {/* Categories */}
          <View style={styles.catRow}>
            {categories.map((c) => {
              const active = c.key === category;
              const restock = c.status === 'restock';
              return (
                <PressableScale
                  key={c.key}
                  activeScale={0.97}
                  onPress={() => setCategory(c.key)}
                  style={[
                    styles.catCard,
                    active && styles.catCardActive,
                    restock && !active && styles.catCardRestock,
                  ]}
                >
                  <View
                    style={[
                      styles.catBadge,
                      { backgroundColor: restock ? palette.coralLight : palette.g100 },
                      active && { backgroundColor: 'rgba(255,255,255,0.2)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.catBadgeText,
                        { color: restock ? palette.coral : palette.g700 },
                        active && { color: palette.white },
                      ]}
                    >
                      {restock ? '⚠ Stok Tipis' : '● Tersedia'}
                    </Text>
                  </View>
                  <Text style={[styles.catName, active && { color: palette.white }, restock && !active && { color: palette.coral }]}>
                    {c.label}
                  </Text>
                  <Text style={[styles.catCount, active && { color: 'rgba(255,255,255,0.65)' }]}>
                    {categoryCounts[c.key]} produk
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          {/* Product grid */}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <Text style={styles.gridHint}>Memuat produk…</Text>
            ) : filtered.length === 0 ? (
              <Text style={styles.gridHint}>Tidak ada produk pada kategori ini.</Text>
            ) : (
              filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={qtyOf(p.id)}
                  onAdd={() => addItem(p)}
                  wide={wide}
                  delay={Math.min(i, 12) * 35}
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* RIGHT: ORDER PANEL */}
        <View style={[styles.orderPanel, wide ? styles.orderPanelWide : styles.orderPanelNarrow]}>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptBack}>
              <Text style={{ color: palette.white, fontSize: 16 }}>›</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.receiptLabel}>STRUK PEMBELIAN</Text>
              <Text style={styles.receiptNum}>{formatReceiptNumber(receiptNumber)}</Text>
            </View>
          </View>

          {/* Payment tabs */}
          <View style={styles.payTabs}>
            {PAYMENT_TABS.map((t) => {
              const active = paymentMethod === t.key;
              return (
                <PressableScale
                  key={t.key}
                  activeScale={0.95}
                  onPress={() => setPaymentMethod(t.key)}
                  style={[styles.payTab, active && styles.payTabActive]}
                >
                  <Text style={[styles.payTabText, active && { color: palette.white }]}>{t.label}</Text>
                </PressableScale>
              );
            })}
          </View>

          {/* Customer */}
          <View style={styles.customerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Nama Pelanggan</Text>
              <TextInput
                style={styles.fieldInput}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Opsional"
                placeholderTextColor={palette.muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>No. Antrian</Text>
              <View style={[styles.fieldInput, { justifyContent: 'center' }]}>
                <Text style={{ color: palette.text, fontSize: 12.5 }}>A-01 ▾</Text>
              </View>
            </View>
          </View>

          {/* Order list */}
          <View style={styles.orderListSection}>
            <Text style={styles.orderListLabel}>Daftar Pesanan</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {items.length === 0 ? (
                <View style={styles.emptyCart}>
                  <Text style={{ fontSize: 36 }}>🛒</Text>
                  <Text style={styles.emptyText}>Belum ada produk{'\n'}dipilih</Text>
                </View>
              ) : (
                items.map((item) => (
                  <Reveal key={item.id} offset={8} duration={300} style={styles.orderItem}>
                    <View style={styles.orderItemEmoji}>
                      <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.orderItemSub}>
                        {formatRupiah(item.price)} × {item.qty} {item.unit}
                      </Text>
                      <View style={styles.qtyControls}>
                        <PressableScale activeScale={0.88} style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}>
                          <Text style={styles.qtyBtnText}>−</Text>
                        </PressableScale>
                        <Text style={styles.qtyNum}>{item.qty}</Text>
                        <PressableScale activeScale={0.88} style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}>
                          <Text style={styles.qtyBtnText}>+</Text>
                        </PressableScale>
                      </View>
                    </View>
                    <Text style={styles.orderItemPrice}>{formatRupiah(item.price * item.qty)}</Text>
                  </Reveal>
                ))
              )}
            </ScrollView>
          </View>

          {/* Payment details */}
          <View style={styles.paymentSection}>
            <Text style={styles.paymentLabel}>Detail Pembayaran</Text>
            <View style={styles.payRow}>
              <Text style={styles.payRowLabel}>Subtotal</Text>
              <Text style={styles.payRowValue}>{formatRupiah(subtotal)}</Text>
            </View>
            <View style={styles.payRow}>
              <Text style={styles.payRowLabel}>Diskon</Text>
              <Text style={[styles.payRowValue, { color: palette.g700 }]}>— Rp 0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.payRow}>
              <Text style={[styles.payRowLabel, styles.totalLabel]}>Total</Text>
              <Text style={[styles.payRowValue, styles.totalValue]}>{formatRupiah(subtotal)}</Text>
            </View>
          </View>

          {/* CTA */}
          <PressableScale
            style={[styles.cta, subtotal === 0 && styles.ctaDisabled]}
            onPress={handlePlaceOrder}
            disabled={subtotal === 0}
          >
            <View style={styles.ctaIcon}>
              <Text style={{ color: palette.white, fontWeight: '700' }}>→</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.ctaText}>Bayar Sekarang</Text>
              <Text style={styles.ctaTotal}>{formatRupiah(subtotal)}</Text>
            </View>
          </PressableScale>
        </View>
      </View>

      {/* Toast */}
      <Animated.View style={[styles.toast, { transform: [{ translateX: -110 }, { translateY: toastY }] }]}>
        <Text style={styles.toastText}>✅ Transaksi berhasil diproses!</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

function ProductCard({
  product,
  qty,
  onAdd,
  wide,
  delay = 0,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  wide: boolean;
  delay?: number;
}) {
  const inCart = qty > 0;
  const anim = useReveal({ delay, offset: 8 });
  return (
    <Animated.View
      style={[styles.prodCard, { width: wide ? '23.5%' : '48%' }, inCart && { borderColor: palette.g900 }, anim]}
    >
      {inCart ? (
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyBadgeText}>{qty}</Text>
        </View>
      ) : null}
      <View style={[styles.prodImg, { backgroundColor: product.bg }]}>
        <Text style={{ fontSize: 34 }}>{product.emoji}</Text>
      </View>
      <Text style={styles.prodName} numberOfLines={1}>{product.name}</Text>
      <View style={styles.prodBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.prodPrice}>
            {formatRupiah(product.price)}
            <Text style={styles.prodUnit}> /{product.unit}</Text>
          </Text>
        </View>
        <PressableScale
          activeScale={0.85}
          style={[styles.addBtn, inCart && { backgroundColor: palette.g900 }]}
          onPress={onAdd}
        >
          <Text style={[styles.addBtnText, inCart && { color: palette.white }]}>＋</Text>
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.cream },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  date: { fontWeight: '600', fontSize: 13, color: palette.g700, marginLeft: 4 },
  txCount: { fontSize: 13, fontWeight: '500', color: palette.muted },
  laporanBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.sm + 1,
    backgroundColor: palette.white,
  },
  laporanText: { fontSize: 13, fontWeight: '600', color: palette.text },

  main: { flex: 1 },

  // product panel
  productPanel: { flex: 1, padding: spacing.lg, gap: 14 },
  search: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: palette.white,
    fontSize: 14,
    color: palette.text,
  },
  catRow: { flexDirection: 'row', gap: 10 },
  catCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.white,
    minHeight: 78,
  },
  catCardActive: { backgroundColor: palette.g900, borderColor: palette.g900 },
  catCardRestock: { borderColor: '#F4C4BF', backgroundColor: '#FDF6F5' },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  catName: { fontWeight: '800', fontSize: 18, color: palette.text },
  catCount: { fontSize: 11, color: palette.muted, marginTop: 1, fontWeight: '500' },

  // grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: '2%', rowGap: 10, paddingBottom: 8 },
  gridHint: { width: '100%', textAlign: 'center', color: palette.muted, fontSize: 13, paddingVertical: 32 },
  prodCard: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 14,
    padding: 12,
  },
  prodImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  prodName: { fontWeight: '500', fontSize: 13, color: palette.text, marginBottom: 4 },
  prodBottom: { flexDirection: 'row', alignItems: 'center' },
  prodPrice: { fontWeight: '600', fontSize: 13, color: palette.text },
  prodUnit: { fontSize: 11, color: palette.muted, fontWeight: '400' },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: palette.g900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: palette.g900, fontSize: 16, lineHeight: 18 },
  qtyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: palette.g900,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadgeText: { color: palette.white, fontSize: 10, fontWeight: '700' },

  // order panel
  orderPanel: { backgroundColor: palette.white },
  orderPanelWide: { width: 310, minWidth: 310, borderLeftWidth: 1, borderLeftColor: palette.border },
  orderPanelNarrow: { borderTopWidth: 1, borderTopColor: palette.border, maxHeight: 460 },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  receiptBack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.g900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptLabel: { fontSize: 10, color: palette.muted, fontWeight: '500', letterSpacing: 0.5 },
  receiptNum: { fontWeight: '700', fontSize: 13, color: palette.text },
  payTabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  payTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center',
  },
  payTabActive: { backgroundColor: palette.g900, borderColor: palette.g900 },
  payTabText: { fontWeight: '600', fontSize: 12, color: palette.muted },
  customerRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  fieldLabel: { fontSize: 11, color: palette.muted, fontWeight: '500', marginBottom: 4 },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
    color: palette.text,
    backgroundColor: palette.cream,
    minHeight: 34,
  },
  orderListSection: {
    flex: 1,
    minHeight: 90,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  orderListLabel: { fontSize: 11, color: palette.muted, fontWeight: '600', letterSpacing: 0.6, marginBottom: 8, textTransform: 'uppercase' },
  emptyCart: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 13, color: palette.muted, textAlign: 'center', marginTop: 8 },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.cream,
    borderRadius: 10,
    padding: 9,
    marginBottom: 7,
  },
  orderItemEmoji: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderItemName: { fontWeight: '600', fontSize: 12.5, color: palette.text },
  orderItemSub: { fontSize: 10.5, color: palette.muted, marginTop: 1 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  qtyBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 13, color: palette.g900, fontWeight: '600', lineHeight: 15 },
  qtyNum: { fontSize: 12, fontWeight: '700', color: palette.text, minWidth: 14, textAlign: 'center' },
  orderItemPrice: { fontWeight: '700', fontSize: 12, color: palette.text },

  paymentSection: { borderTopWidth: 1, borderTopColor: palette.border, paddingHorizontal: 16, paddingTop: 12 },
  paymentLabel: { fontSize: 12, fontWeight: '700', color: palette.text, marginBottom: 8 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  payRowLabel: { fontSize: 12.5, color: palette.muted },
  payRowValue: { fontSize: 12.5, color: palette.text, fontWeight: '500' },
  totalLabel: { fontSize: 13.5, fontWeight: '700', color: palette.text },
  totalValue: { fontSize: 13.5, fontWeight: '800', color: palette.text },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: 7 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 13,
    backgroundColor: palette.g900,
    borderRadius: 14,
  },
  ctaDisabled: { backgroundColor: '#B0C4BA' },
  ctaIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontWeight: '700', fontSize: 14, color: palette.white },
  ctaTotal: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  toast: {
    position: 'absolute',
    top: 30,
    left: '50%',
    backgroundColor: palette.g900,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    width: 220,
    alignItems: 'center',
  },
  toastText: { color: palette.white, fontWeight: '600', fontSize: 14 },
});
