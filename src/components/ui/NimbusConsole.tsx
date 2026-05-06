import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/theme';

export type ConsoleStatus = 'running' | 'stopped' | 'error' | 'pending';

export interface ConsolePanel {
  id: string;
  title: string;
  status: ConsoleStatus;
  actionLabel: string;
}

interface NimbusConsoleProps {
  panels: ConsolePanel[];
  onAction: (actionId: string) => void;
}

const STATUS_COLORS: Record<ConsoleStatus, string> = {
  running: Colors.success,
  stopped: Colors.pending,
  error: Colors.error,
  pending: Colors.warning,
};

const STATUS_LABELS: Record<ConsoleStatus, string> = {
  running: 'Running',
  stopped: 'Stopped',
  error: 'Error',
  pending: 'Pending',
};

function StatusBadge({ status }: { status: ConsoleStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] + '26' }]}>
      <View style={[styles.badgeDot, { backgroundColor: STATUS_COLORS[status] }]} />
      <Text style={[styles.badgeText, { color: STATUS_COLORS[status] }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

export default function NimbusConsole({ panels, onAction }: NimbusConsoleProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {panels.map(panel => (
        <View key={panel.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{panel.title}</Text>
            <StatusBadge status={panel.status} />
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onAction(panel.id)}
            activeOpacity={0.75}
          >
            <Text style={styles.actionLabel}>{panel.actionLabel}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.headline,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...Typography.caption1,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  actionLabel: {
    ...Typography.callout,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
