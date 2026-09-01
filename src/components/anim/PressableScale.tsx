import { forwardRef, useRef, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const useNativeDriver = Platform.OS !== 'web';

// Pressable yang bisa dianimasikan — transform ditempel langsung ke node-nya
// agar style tata letak (flex, width) tetap berlaku persis seperti Pressable biasa.
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Skala saat ditekan (default 0.96). */
  activeScale?: number;
}

/**
 * Pressable dengan umpan balik skala halus (spring) saat ditekan —
 * memberi kesan tombol/kartu "menekan" tanpa mengubah tata letaknya.
 * Meneruskan ref agar aman dipakai di dalam `<Link asChild>` (expo-router).
 */
export const PressableScale = forwardRef<View, Props>(function PressableScale(
  { children, style, activeScale = 0.96, onPressIn, onPressOut, disabled, ...rest },
  ref,
) {
  const scale = useRef(new Animated.Value(1)).current;

  const springTo = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver,
      friction: 7,
      tension: 180,
    }).start();

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      onPressIn={(e: GestureResponderEvent) => {
        if (!disabled) springTo(activeScale);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        springTo(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
});
