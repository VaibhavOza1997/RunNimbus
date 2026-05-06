import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Ellipse, Circle, Path, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

export interface CloudyProps {
  size?: number;
  primaryColor?: string;
  animation?: 'idle' | 'happy' | 'worried' | 'fail' | 'celebrate';
  accessory?: string | null; // TODO: [AVATAR] accessory system
  skinTone?: string; // TODO: [AVATAR] skin tone variants
}

const DEFAULT_COLOR = '#F0F4FF';

export default function Cloudy({
  size = 120,
  primaryColor = DEFAULT_COLOR,
  animation = 'idle',
}: CloudyProps) {
  // Proportions: head = 60% of total height
  const headSize = size * 0.6;
  const bodyWidth = size * 0.28;
  const bodyHeight = size * 0.32;

  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scaleY = useSharedValue(1);

  useEffect(() => {
    // Reset all values before applying new animation
    translateY.value = 0;
    translateX.value = 0;
    rotate.value = 0;
    scaleY.value = 1;

    switch (animation) {
      case 'idle':
        // TODO: [AVATAR] enhance animation — add subtle squash/stretch on bottom of bob
        translateY.value = withRepeat(
          withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          -1,
          true
        );
        break;

      case 'happy':
        // TODO: [AVATAR] enhance animation — add eye squint and blush
        translateY.value = withRepeat(
          withSequence(
            withTiming(-14, { duration: 220, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) })
          ),
          3,
          false
        );
        break;

      case 'worried':
        // TODO: [AVATAR] enhance animation — add sweat drop element
        translateX.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 90 }),
            withTiming(8, { duration: 90 }),
            withTiming(-6, { duration: 90 }),
            withTiming(6, { duration: 90 }),
            withTiming(0, { duration: 90 })
          ),
          3,
          false
        );
        break;

      case 'fail':
        // TODO: [AVATAR] enhance animation — animate eye shape to sad arcs
        translateY.value = withSequence(
          withTiming(0, { duration: 100 }),
          withSpring(size * 0.08, { damping: 6, stiffness: 80 })
        );
        scaleY.value = withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0.88, { duration: 300, easing: Easing.out(Easing.quad) })
        );
        break;

      case 'celebrate':
        // TODO: [AVATAR] enhance animation — add confetti particle emitter
        translateY.value = withRepeat(
          withSequence(
            withTiming(-18, { duration: 180, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) })
          ),
          4,
          false
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(-12, { duration: 120 }),
            withTiming(12, { duration: 120 }),
            withTiming(0, { duration: 120 })
          ),
          4,
          false
        );
        break;
    }
  }, [animation, size, translateY, translateX, rotate, scaleY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scaleY: scaleY.value },
    ],
  }));

  const eyeY = headSize * 0.42;
  const eyeSpacing = headSize * 0.18;
  const eyeRadius = headSize * 0.055;
  const smileY = headSize * 0.6;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Animated.View style={animatedStyle}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Body (stub — below head) */}
          <G>
            <Ellipse
              cx={size / 2}
              cy={size * 0.86}
              rx={bodyWidth / 2}
              ry={bodyHeight / 2}
              fill={primaryColor}
              opacity={0.7}
            />
          </G>
          {/* Head cloud — main circle + bumps */}
          <G>
            {/* Bumps on top of head for cloud silhouette */}
            <Circle cx={size * 0.32} cy={size * 0.36} r={headSize * 0.22} fill={primaryColor} />
            <Circle cx={size * 0.5} cy={size * 0.28} r={headSize * 0.28} fill={primaryColor} />
            <Circle cx={size * 0.68} cy={size * 0.36} r={headSize * 0.22} fill={primaryColor} />
            {/* Main head ellipse */}
            <Ellipse
              cx={size / 2}
              cy={size * 0.46}
              rx={headSize * 0.44}
              ry={headSize * 0.38}
              fill={primaryColor}
            />
          </G>
          {/* Eyes */}
          <Circle
            cx={size / 2 - eyeSpacing}
            cy={eyeY + size * 0.08}
            r={eyeRadius}
            fill="#1C1C1E"
          />
          <Circle
            cx={size / 2 + eyeSpacing}
            cy={eyeY + size * 0.08}
            r={eyeRadius}
            fill="#1C1C1E"
          />
          {/* Eye shine */}
          <Circle
            cx={size / 2 - eyeSpacing + eyeRadius * 0.4}
            cy={eyeY + size * 0.08 - eyeRadius * 0.4}
            r={eyeRadius * 0.35}
            fill="white"
            opacity={0.8}
          />
          <Circle
            cx={size / 2 + eyeSpacing + eyeRadius * 0.4}
            cy={eyeY + size * 0.08 - eyeRadius * 0.4}
            r={eyeRadius * 0.35}
            fill="white"
            opacity={0.8}
          />
          {/* Smile */}
          <Path
            d={`M ${size / 2 - headSize * 0.12} ${smileY + size * 0.06}
               Q ${size / 2} ${smileY + size * 0.12}
                 ${size / 2 + headSize * 0.12} ${smileY + size * 0.06}`}
            stroke="#1C1C1E"
            strokeWidth={headSize * 0.03}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
