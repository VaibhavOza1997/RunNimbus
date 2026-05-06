import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSagaStore } from '@/services/saga/sagaStore';
import { useCurrentUser } from '@/services/auth/authStore';
import { useSignals } from '@/services/signals/signalsStore';
import { SagaStep } from '@/services/saga/sagaTypes';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import type { PlayStackParamList } from '@/navigation/PlayStackNavigator';

type RouteProps = RouteProp<PlayStackParamList, 'SagaDetail'>;
type Nav = NativeStackNavigationProp<PlayStackParamList, 'SagaDetail'>;

function StepRow({
  step,
  isCompleted,
  isCurrent,
  onPress,
}: {
  step: SagaStep;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
}) {
  const typeIcon: Record<SagaStep['type'], string> = {
    instruction: '📋',
    terminal: '💻',
    'ui-interaction': '🖱️',
  };

  return (
    <TouchableOpacity
      style={[styles.stepRow, isCurrent && styles.stepRowActive, isCompleted && styles.stepRowDone]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!isCurrent && !isCompleted}
    >
      <View style={styles.stepNumWrap}>
        <Text style={[styles.stepNum, isCompleted && styles.stepNumDone]}>
          {isCompleted ? '✓' : String(step.id)}
        </Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepType}>
          {typeIcon[step.type]} {step.type.toUpperCase()}
        </Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        {step.challenge && (
          <View style={styles.challengePill}>
            <Text style={styles.challengePillText}>⚡ Challenge</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function SagaDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { sagaId } = route.params;

  const { activeSaga, activeProgress, startSaga, isLoading } = useSagaStore();
  const currentUser = useCurrentUser();
  const { consumeSignal } = useSignals();

  useEffect(() => {
    if (currentUser) {
      startSaga(sagaId, currentUser.id);
    }
  }, [sagaId, currentUser, startSaga]);

  const handleStepPress = (stepId: number) => {
    const isFirst = activeProgress?.completedSteps.length === 0 && stepId === 1;
    const isNext = stepId === (activeProgress?.currentStepId ?? 1);

    if (!isFirst && !isNext) return;

    const hasSignal = consumeSignal();
    if (!hasSignal) {
      // TODO: [SIGNALS] show paywall / ad offer modal
      return;
    }

    navigation.navigate('Step', { sagaId, stepId });
  };

  if (isLoading || !activeSaga || !activeProgress) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeSaga.title}</Text>
        <Text style={styles.description}>{activeSaga.description}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(activeProgress.completedSteps.length / activeSaga.totalSteps) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {activeProgress.completedSteps.length}/{activeSaga.totalSteps} steps
        </Text>
      </View>

      <FlatList
        data={activeSaga.steps}
        keyExtractor={s => String(s.id)}
        renderItem={({ item }) => (
          <StepRow
            step={item}
            isCompleted={activeProgress.completedSteps.includes(item.id)}
            isCurrent={item.id === activeProgress.currentStepId}
            onPress={() => handleStepPress(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.title2, color: Colors.textPrimary, marginBottom: Spacing.xs },
  description: { ...Typography.subheadline, color: Colors.textSecondary, marginBottom: Spacing.md },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
  },
  progressText: { ...Typography.caption1, color: Colors.textTertiary },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  stepRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    opacity: 0.45,
  },
  stepRowActive: { opacity: 1, borderWidth: 1, borderColor: Colors.primary },
  stepRowDone: { opacity: 0.7 },
  stepNumWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { ...Typography.footnote, color: Colors.textSecondary, fontWeight: '700' },
  stepNumDone: { color: Colors.success },
  stepContent: { flex: 1, gap: 3 },
  stepType: { ...Typography.caption2, color: Colors.textTertiary, letterSpacing: 0.5 },
  stepTitle: { ...Typography.callout, color: Colors.textPrimary, fontWeight: '600' },
  challengePill: {
    backgroundColor: Colors.warning + '26',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  challengePillText: { ...Typography.caption2, color: Colors.warning, fontWeight: '600' },
});
