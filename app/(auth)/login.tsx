import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, radius, spacing } from '@/constants/theme';
import { Reveal } from '@/components/anim/Reveal';
import { PressableScale } from '@/components/anim/PressableScale';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Reveal style={styles.card} offset={18} duration={460}>
          <View style={styles.logoDot} />
          <Text style={styles.brand}>TOKO SAYURAN</Text>
          <Text style={styles.title}>Masuk ke POS</Text>
          <Text style={styles.subtitle}>Kelola kasir, stok, dan laporan toko Anda</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="nama@toko.com"
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            inputMode="email"
          />

          <Text style={styles.label}>Kata Sandi</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={palette.muted}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PressableScale
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </PressableScale>

          {!isSupabaseConfigured ? (
            <Text style={styles.demoNote}>
              Mode demo aktif — Supabase belum dikonfigurasi. Tekan “Masuk” dengan
              kredensial apa pun untuk melanjutkan.
            </Text>
          ) : null}
        </Reveal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.backdrop },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: palette.cream,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.g900, marginBottom: 8 },
  brand: { fontWeight: '800', fontSize: 13, letterSpacing: 1, color: palette.g900 },
  title: { fontWeight: '800', fontSize: 24, color: palette.text, marginTop: 12 },
  subtitle: { fontSize: 13, color: palette.muted, marginTop: 4, marginBottom: 20 },
  label: { fontSize: 12, color: palette.muted, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: palette.text,
    backgroundColor: palette.white,
  },
  error: { color: palette.coral, fontSize: 12.5, marginTop: 12 },
  button: {
    backgroundColor: palette.g900,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonText: { color: palette.white, fontWeight: '700', fontSize: 15 },
  demoNote: { fontSize: 11.5, color: palette.muted, marginTop: 16, lineHeight: 17, textAlign: 'center' },
});
