import { StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/theme';

export interface Series {
  label: string;
  data: number[];
  color: string;
}

interface Props {
  labels: string[];
  series: Series[];
  height?: number;
}

/**
 * Bar chart bertumpuk (stacked) sederhana memakai View — tanpa dependency
 * grafik native, sehingga ringan dan berjalan sama di web maupun mobile.
 * Setiap kolom menumpuk kontribusi tiap kategori.
 */
export function StackedBarChart({ labels, series, height = 170 }: Props) {
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + (s.data[i] ?? 0), 0));
  const max = Math.max(1, ...totals);
  const plotHeight = height - 24; // sisakan ruang untuk label sumbu-x

  return (
    <View>
      <View style={[styles.plot, { height: plotHeight }]}>
        {labels.map((label, colIndex) => (
          <View key={label} style={styles.column}>
            <View style={styles.barStack}>
              {series.map((s) => {
                const value = s.data[colIndex] ?? 0;
                const h = (value / max) * plotHeight;
                return (
                  <View
                    key={s.label}
                    style={{ height: h, backgroundColor: s.color, width: '100%' }}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.axis}>
        {labels.map((label) => (
          <Text key={label} style={styles.axisLabel} numberOfLines={1}>
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  column: { flex: 1, justifyContent: 'flex-end' },
  barStack: {
    flexDirection: 'column-reverse',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
  axis: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  axisLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    color: palette.muted,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: palette.muted },
});
