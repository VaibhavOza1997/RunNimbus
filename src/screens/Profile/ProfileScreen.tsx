import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentUser } from '@/services/auth/authStore';
import SignalsBar from '@/components/ui/SignalsBar';
import Cloudy from '@/components/cloudy/Cloudy';
import { useMonetization } from '@/services/monetization/monetizationStore';
import { PRICING } from '@/config/pricing';
import { Colors, Spacing, Radius, Typography } from '@/theme';

const TIER_LABELS = {
  free: 'Free',
  pro_monthly: 'Pro Monthly',
  pro_annual: 'Pro Annual',
};

export default function ProfileScreen() {
  const currentUser = useCurrentUser();
  const { currentTier, purchaseMonthly, purchaseAnnual } = useMonetization();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <Cloudy size={100} animation="idle" />
          <Text style={styles.userName}>{currentUser?.name ?? 'Cloud Engineer'}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierBadgeText}>{TIER_LABELS[currentTier]}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signals</Text>
          <SignalsBar />
        </View>

        {currentTier === 'free' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upgrade to Pro</Text>
            <Text style={styles.proSubtitle}>Unlimited signals, no ads, early access to new Sagas.</Text>

            <TouchableOpacity style={styles.proBtn} onPress={purchaseMonthly} activeOpacity={0.8}>
              <Text style={styles.proBtnTitle}>Monthly</Text>
              <Text style={styles.proBtnPrice}>${PRICING.PRO_MONTHLY_USD}/mo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.proBtn, styles.proBtnAnnual]}
              onPress={purchaseAnnual}
              activeOpacity={0.8}
            >
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>BEST VALUE</Text>
              </View>
              <Text style={styles.proBtnTitle}>Annual</Text>
              <Text style={styles.proBtnPrice}>${PRICING.PRO_ANNUAL_USD}/yr</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Sagas Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Challenges Solved</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxxl },
  avatarSection: { alignItems: 'center', gap: Spacing.sm },
  userName: { ...Typography.title2, color: Colors.textPrimary },
  tierBadge: {
    backgroundColor: Colors.primary + '26',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  tierBadgeText: { ...Typography.footnote, color: Colors.primary, fontWeight: '700' },
  section: { gap: Spacing.md },
  sectionTitle: { ...Typography.title3, color: Colors.textPrimary },
  proSubtitle: { ...Typography.subheadline, color: Colors.textSecondary },
  proBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proBtnAnnual: { borderColor: Colors.signalPro + '80', position: 'relative' },
  proBtnTitle: { ...Typography.headline, color: Colors.textPrimary },
  proBtnPrice: { ...Typography.headline, color: Colors.primary, fontWeight: '700' },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.md,
    backgroundColor: Colors.signalPro,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  saveBadgeText: { ...Typography.caption2, color: Colors.background, fontWeight: '800', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: { ...Typography.title1, color: Colors.textPrimary },
  statLabel: { ...Typography.caption1, color: Colors.textSecondary, textAlign: 'center' },
});
