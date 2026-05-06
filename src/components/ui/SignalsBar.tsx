import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';
import { useSignals } from '@/services/signals/signalsStore';
import { SignalSlot } from '@/services/signals/signalsTypes';
import { Colors, Spacing, Typography } from '@/theme';
import { SIGNAL_REFILL_HOURS } from '@/config/pricing';

const REFILL_MS = SIGNAL_REFILL_HOURS * 60 * 60 * 1000;

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function RefillPulse({ color }: { color: string }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, style, { backgroundColor: color, borderRadius: 4 }]} />;
}

function SignalIcon({ slot, isPro }: { slot: SignalSlot; isPro: boolean }) {
  const color = isPro ? Colors.signalPro : slot.full ? Colors.signal : '#3A3A3C';
  const isRefilling = !slot.full && slot.emptyAt !== null;

  return (
    <View style={styles.iconWrapper}>
      {isRefilling && <RefillPulse color={Colors.signal + '33'} />}
      <Svg width={28} height={36} viewBox="0 0 28 36">
        {/* Heart outline */}
        <Path
          d="M14 32 C14 32 2 22 2 12 C2 7 6 4 10 4 C12 4 13.5 5 14 6 C14.5 5 16 4 18 4 C22 4 26 7 26 12 C26 22 14 32 14 32Z"
          fill={color}
          stroke={slot.full || isPro ? 'transparent' : '#5A5A5C'}
          strokeWidth={1}
        />
        {/* CPU chip grid inside heart (decorative) */}
        <Rect x={10} y={13} width={8} height={8} fill="rgba(0,0,0,0.2)" rx={1} />
        <Line x1={12} y1={13} x2={12} y2={21} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
        <Line x1={16} y1={13} x2={16} y2={21} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
        <Line x1={10} y1={16} x2={18} y2={16} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />
        {/* Tiny connector nubs */}
        <Rect x={8} y={15} width={2} height={2} fill="rgba(0,0,0,0.2)" rx={0.5} />
        <Rect x={18} y={15} width={2} height={2} fill="rgba(0,0,0,0.2)" rx={0.5} />
        {/* Crack for empty slot */}
        {!slot.full && !isPro && (
          <Path
            d="M13 10 L14.5 14 L13.5 15 L15 19"
            stroke="#5A5A5C"
            strokeWidth={1}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {/* Pro dot */}
        {isPro && <Circle cx={14} cy={17} r={3} fill="rgba(0,0,0,0.25)" />}
      </Svg>
    </View>
  );
}

function SlotCountdown({ emptyAt }: { emptyAt: number }) {
  const [remaining, setRemaining] = useState(REFILL_MS - (Date.now() - emptyAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(REFILL_MS - (Date.now() - emptyAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [emptyAt]);

  if (remaining <= 0) return null;

  return <Text style={styles.countdown}>{formatCountdown(remaining)}</Text>;
}

export default function SignalsBar() {
  const { slots, isPro } = useSignals();

  return (
    <View style={styles.container}>
      {isPro ? (
        <View style={styles.proRow}>
          <Text style={styles.proInfinity}>∞</Text>
          <Text style={styles.proLabel}>Pro — Unlimited Signals</Text>
        </View>
      ) : (
        <View style={styles.slotsRow}>
          {slots.map(slot => (
            <View key={slot.id} style={styles.slotWrapper}>
              <SignalIcon slot={slot} isPro={isPro} />
              {!slot.full && slot.emptyAt !== null && (
                <SlotCountdown emptyAt={slot.emptyAt} />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  slotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  slotWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 28,
    height: 36,
    position: 'relative',
  },
  countdown: {
    ...Typography.caption2,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  proInfinity: {
    fontSize: 24,
    color: Colors.signalPro,
    fontWeight: '700',
  },
  proLabel: {
    ...Typography.subheadline,
    color: Colors.signalPro,
    fontWeight: '600',
  },
});
