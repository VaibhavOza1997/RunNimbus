import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '@/theme';

export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.placeholder}>
          {/* TODO: [SOCIAL] wire to socialRepository.getLeaderboard() */}
          Squad rankings coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  title: { ...Typography.title2, color: Colors.textPrimary, marginBottom: Spacing.md },
  placeholder: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center' },
});
