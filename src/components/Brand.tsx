import { StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/theme';

/** Logo teks "TOKO SAYURAN" dengan titik hijau, seperti pada mockup. */
export function Brand({ line1 = 'TOKO', line2 = 'SAYURAN' }: { line1?: string; line2?: string }) {
  return (
    <View style={styles.brand}>
      <View style={styles.dot} />
      <Text style={styles.name}>
        {line1}
        {'\n'}
        {line2}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { marginRight: 4 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: palette.g900,
    marginBottom: 3,
  },
  name: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
    color: palette.g900,
    lineHeight: 14,
  },
});
