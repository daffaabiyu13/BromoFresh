import { StyleSheet, Text, View } from 'react-native';
import { palette, radius } from '@/constants/theme';
import { PressableScale } from '@/components/anim/PressableScale';

/** Tombol lonceng notifikasi dengan titik merah penanda. */
export function NotifButton({ onPress, hasDot = true }: { onPress?: () => void; hasDot?: boolean }) {
  return (
    <PressableScale style={styles.btn} onPress={onPress}>
      <Text style={styles.bell}>🔔</Text>
      {hasDot ? <View style={styles.dot} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.sm + 1,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: { fontSize: 15 },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.coral,
    borderWidth: 1.5,
    borderColor: palette.cream,
  },
});
