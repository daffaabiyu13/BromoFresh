import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';

// react-native-web tidak punya native driver; pakai driver JS di web, native di HP.
const useNativeDriver = Platform.OS !== 'web';

export interface RevealOptions {
  /** Jeda sebelum animasi mulai (ms) — untuk efek berurutan/stagger. */
  delay?: number;
  /** Durasi animasi (ms). */
  duration?: number;
  /** Offset vertikal awal (px). Positif = meluncur naik ke posisinya. */
  offset?: number;
}

/**
 * Hook animasi "masuk": fade + slide-up halus saat komponen pertama tampil.
 * Mengembalikan style animasi yang tinggal ditempel ke `Animated.View`.
 */
export function useReveal({ delay = 0, duration = 380, offset = 10 }: RevealOptions = {}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });

  return { opacity: progress, transform: [{ translateY }] };
}
