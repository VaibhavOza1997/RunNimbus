import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import { storageSet } from '@/utils/storage';

interface GCPAnnotationProps {
  text: string;
  visible: boolean;
  stepId: number;
  onDismiss: () => void;
}

const DISMISS_KEY_PREFIX = 'gcp_annotation_dismissed_v1_step_';

export default function GCPAnnotation({ text, visible, stepId, onDismiss }: GCPAnnotationProps) {
  const translateX = useSharedValue(200);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateX.value = withTiming(200, { duration: 250 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const handleDismiss = async () => {
    await storageSet(`${DISMISS_KEY_PREFIX}${stepId}`, true);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.inner}>
        <View style={styles.cloudIcon}>
          <Text style={styles.cloudEmoji}>☁️</Text>
        </View>
        <Text style={styles.text} numberOfLines={3}>
          {text}
        </Text>
        <TouchableOpacity onPress={handleDismiss} style={styles.dismissBtn} hitSlop={8}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl,
    maxWidth: 260,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gcpBlue,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cloudIcon: {
    paddingTop: 1,
  },
  cloudEmoji: {
    fontSize: 16,
  },
  text: {
    ...Typography.footnote,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  dismissBtn: {
    paddingLeft: Spacing.xs,
  },
  dismissText: {
    ...Typography.footnote,
    color: Colors.textPrimary,
    opacity: 0.8,
    fontWeight: '700',
  },
});
