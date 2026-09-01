import type { ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useReveal, type RevealOptions } from '@/components/anim/useReveal';

interface RevealProps extends RevealOptions {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pembungkus animasi masuk (fade + slide-up) untuk seksi mana pun.
 * Beri `delay` berbeda pada beberapa Reveal agar muncul berurutan.
 */
export function Reveal({ children, style, delay, duration, offset }: RevealProps) {
  const anim = useReveal({ delay, duration, offset });
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
