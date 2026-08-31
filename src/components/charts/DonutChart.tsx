import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export interface DonutSlice {
  value: number;
  color: string;
}

interface Props {
  data: DonutSlice[];
  size?: number;
  strokeWidth?: number;
}

/**
 * Donut chart memakai react-native-svg. Tiap irisan digambar sebagai busur
 * lingkaran via strokeDasharray + strokeDashoffset (berjalan di web & native).
 */
export function DonutChart({ data, size = 150, strokeWidth = 22 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  let offset = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {data.map((slice, i) => {
          const fraction = slice.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const el = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={slice.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              // mulai dari atas (jam 12)
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return el;
        })}
      </Svg>
    </View>
  );
}
