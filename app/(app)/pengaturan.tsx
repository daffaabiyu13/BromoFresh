import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AppShell } from '@/components/AppShell';
import { Card, CardHeader } from '@/components/Card';
import { PressableScale } from '@/components/anim/PressableScale';
import { palette, radius } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore, type PaperSize, type ThemePref } from '@/store/useSettingsStore';

export default function PengaturanScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const s = useSettingsStore();

  // Pengaturan hanya untuk Owner (PRD §03).
  if (role && role !== 'owner') {
    return (
      <AppShell headerCenter={<Text style={styles.headerTitle}>Pengaturan</Text>}>
        <Card>
          <Text style={styles.restrictedTitle}>🔒 Akses Terbatas</Text>
          <Text style={styles.restrictedText}>Modul Pengaturan hanya dapat diakses oleh Owner.</Text>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      headerCenter={
        <View>
          <Text style={styles.headerTitle}>Pengaturan</Text>
          <Text style={styles.headerSub}>Konfigurasi toko & sistem</Text>
        </View>
      }
      headerRight={
        <PressableScale style={styles.resetBtn} onPress={s.reset}>
          <Text style={styles.resetText}>Reset</Text>
        </PressableScale>
      }
    >
      <View style={styles.grid}>
        {/* INFO TOKO */}
        <Card style={styles.col}>
          <CardHeader title="Info Toko" subtitle="Muncul di struk & laporan" />
          <Field label="Nama Toko" value={s.storeName} onChangeText={(v) => s.update('storeName', v)} />
          <Field label="Alamat" value={s.storeAddress} onChangeText={(v) => s.update('storeAddress', v)} />
          <Field label="No. Telepon" value={s.storePhone} onChangeText={(v) => s.update('storePhone', v)} keyboardType="phone-pad" />
        </Card>

        {/* PAJAK */}
        <Card style={styles.col}>
          <CardHeader title="Pajak" subtitle="PPN opsional" />
          <ToggleRow label="Aktifkan PPN" value={s.taxEnabled} onValueChange={(v) => s.update('taxEnabled', v)} />
          {s.taxEnabled ? (
            <Field
              label="Persentase (%)"
              value={String(s.taxPercent)}
              onChangeText={(v) => s.update('taxPercent', Number(v.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
            />
          ) : null}
        </Card>

        {/* METODE PEMBAYARAN */}
        <Card style={styles.col}>
          <CardHeader title="Metode Pembayaran" subtitle="Aktif di kasir" />
          <ToggleRow label="Tunai" value={s.payTunai} onValueChange={(v) => s.update('payTunai', v)} />
          <ToggleRow label="QRIS" value={s.payQris} onValueChange={(v) => s.update('payQris', v)} />
          <ToggleRow label="Transfer Bank" value={s.payTransfer} onValueChange={(v) => s.update('payTransfer', v)} />
          {s.payTransfer ? (
            <Field label="Rekening Bank" value={s.bankAccount} onChangeText={(v) => s.update('bankAccount', v)} />
          ) : null}
          {s.payQris ? (
            <Field label="Nama QRIS" value={s.qrisName} onChangeText={(v) => s.update('qrisName', v)} />
          ) : null}
        </Card>

        {/* PRINTER */}
        <Card style={styles.col}>
          <CardHeader title="Printer Struk" subtitle="Bluetooth thermal" />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Ukuran Kertas</Text>
            <View style={styles.segment}>
              {(['58', '80'] as PaperSize[]).map((size) => {
                const active = s.paperSize === size;
                return (
                  <PressableScale key={size} onPress={() => s.update('paperSize', size)} style={[styles.segBtn, active && styles.segBtnActive]}>
                    <Text style={[styles.segText, active && { color: palette.white }]}>{size}mm</Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          <ToggleRow label="Sambungkan Bluetooth Printer" value={s.bluetoothPrinter} onValueChange={(v) => s.update('bluetoothPrinter', v)} />
        </Card>

        {/* NOTIFIKASI */}
        <Card style={styles.col}>
          <CardHeader title="Notifikasi" subtitle="Kirim ke ponsel owner" />
          <ToggleRow label="Alert Stok Kritis" value={s.notifStokKritis} onValueChange={(v) => s.update('notifStokKritis', v)} />
          <ToggleRow label="Pencapaian Target Harian" value={s.notifTargetHarian} onValueChange={(v) => s.update('notifTargetHarian', v)} />
        </Card>

        {/* TAMPILAN */}
        <Card style={styles.col}>
          <CardHeader title="Tema Tampilan" subtitle="Preferensi tema" />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tema</Text>
            <View style={styles.segment}>
              {(['terang', 'gelap', 'sistem'] as ThemePref[]).map((t) => {
                const active = s.theme === t;
                return (
                  <PressableScale key={t} onPress={() => s.update('theme', t)} style={[styles.segBtn, active && styles.segBtnActive]}>
                    <Text style={[styles.segText, active && { color: palette.white }]}>
                      {t === 'terang' ? 'Terang' : t === 'gelap' ? 'Gelap' : 'Sistem'}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </Card>
      </View>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
}) {
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={palette.muted}
      />
    </View>
  );
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: palette.g500, false: palette.border }}
        thumbColor={palette.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontWeight: '700', fontSize: 15, color: palette.text },
  headerSub: { fontSize: 11, color: palette.muted },
  restrictedTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: 6 },
  restrictedText: { fontSize: 13, color: palette.muted, lineHeight: 19 },
  resetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm + 1,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.white,
  },
  resetText: { fontSize: 12, fontWeight: '600', color: palette.text },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  col: { flexGrow: 1, flexBasis: 320, minWidth: 300 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: palette.border2,
    marginTop: 6,
  },
  rowLabel: { fontSize: 13, color: palette.text, flex: 1 },

  fieldLabel: { fontSize: 11, color: palette.muted, fontWeight: '500', marginBottom: 4 },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: palette.text,
    backgroundColor: palette.cream,
  },

  segment: {
    flexDirection: 'row',
    gap: 3,
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 2,
  },
  segBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6 },
  segBtnActive: { backgroundColor: palette.g900 },
  segText: { fontSize: 12, fontWeight: '600', color: palette.muted },
});
