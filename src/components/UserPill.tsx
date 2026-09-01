import { StyleSheet, Text, View } from 'react-native';
import { palette, radius } from '@/constants/theme';
import { PressableScale } from '@/components/anim/PressableScale';

interface Props {
  name: string;
  role: string;
  avatar: string;
  onPress?: () => void;
}

/** Kartu kecil identitas pengguna di pojok kanan top bar. */
export function UserPill({ name, role, avatar, onPress }: Props) {
  return (
    <PressableScale style={styles.pill} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{avatar}</Text>
      </View>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.sm + 1,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: palette.g100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14 },
  name: { fontWeight: '700', fontSize: 12, color: palette.text },
  role: { fontSize: 10, color: palette.muted, fontWeight: '500' },
});
