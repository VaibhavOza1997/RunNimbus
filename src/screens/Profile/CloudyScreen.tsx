import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Cloudy, { CloudyProps } from '@/components/cloudy/Cloudy';
import { Colors, Spacing, Radius, Typography } from '@/theme';

const ANIMATIONS: Array<CloudyProps['animation']> = [
  'idle', 'happy', 'worried', 'fail', 'celebrate',
];

export default function CloudyScreen() {
  const [activeAnimation, setActiveAnimation] = useState<CloudyProps['animation']>('idle');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Avatar</Text>

        <View style={styles.avatarStage}>
          <Cloudy size={160} animation={activeAnimation} />
        </View>

        <Text style={styles.sectionLabel}>Animations</Text>
        <View style={styles.animRow}>
          {ANIMATIONS.map(anim => (
            <TouchableOpacity
              key={anim}
              style={[styles.animBtn, activeAnimation === anim && styles.animBtnActive]}
              onPress={() => setActiveAnimation(anim)}
              activeOpacity={0.75}
            >
              <Text style={[styles.animBtnText, activeAnimation === anim && styles.animBtnTextActive]}>
                {anim}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.shopPlaceholder}>
          <Text style={styles.shopTitle}>Customization Shop</Text>
          <Text style={styles.shopSubtitle}>
            {/* TODO: [AVATAR] build accessory shop and skin selector */}
            Skins and accessories coming soon.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxxl },
  title: { ...Typography.title2, color: Colors.textPrimary },
  avatarStage: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxxl,
  },
  sectionLabel: { ...Typography.headline, color: Colors.textSecondary },
  animRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  animBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  animBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  animBtnText: { ...Typography.subheadline, color: Colors.textSecondary },
  animBtnTextActive: { color: Colors.textPrimary, fontWeight: '600' },
  shopPlaceholder: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  shopTitle: { ...Typography.headline, color: Colors.textPrimary },
  shopSubtitle: { ...Typography.subheadline, color: Colors.textSecondary, textAlign: 'center' },
});
