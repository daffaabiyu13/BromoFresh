import type { ReactNode } from 'react';
import { Animated, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { palette, radius, spacing } from '@/constants/theme';
import { useReveal } from '@/components/anim/useReveal';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Jeda animasi masuk (ms) — beri nilai berbeda antar-kartu untuk efek berurutan. */
  delay?: number;
}

/** Kartu putih berbingkai — wadah dasar untuk konten di Dashboard & Laporan. */
export function Card({ children, style, delay }: CardProps) {
  const anim = useReveal({ delay });
  return <Animated.View style={[styles.card, style, anim]}>{children}</Animated.View>;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function CardHeader({ title, subtitle, right }: CardHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { fontWeight: '700', fontSize: 14, color: palette.text },
  subtitle: { fontSize: 12, color: palette.muted, marginTop: 1 },
});
