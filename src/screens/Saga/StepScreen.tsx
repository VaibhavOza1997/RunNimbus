import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSagaStore } from '@/services/saga/sagaStore';
import NimbusTerminal from '@/components/ui/NimbusTerminal';
import NimbusConsole, { ConsolePanel } from '@/components/ui/NimbusConsole';
import GCPAnnotation from '@/components/ui/GCPAnnotation';
import Cloudy from '@/components/cloudy/Cloudy';
import { showAdIfNeeded } from '@/services/monetization/adEngine';
import { useMonetizationStore } from '@/services/monetization/monetizationStore';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import type { PlayStackParamList } from '@/navigation/PlayStackNavigator';

type RouteProps = RouteProp<PlayStackParamList, 'Step'>;
type Nav = NativeStackNavigationProp<PlayStackParamList, 'Step'>;

const STUB_PANELS: ConsolePanel[] = [
  { id: 'vpc', title: 'Virtual Network', status: 'running', actionLabel: 'View Details' },
  { id: 'db', title: 'Database Instance', status: 'pending', actionLabel: 'Configure' },
];

export default function StepScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { sagaId, stepId } = route.params;

  const { activeSaga, activeProgress, completeStep } = useSagaStore();
  const hasNoAds = useMonetizationStore(s => s.hasNoAds());

  const [terminalLines, setTerminalLines] = useState<string[]>([
    'Cloud environment initialized.',
    'Ready for your commands.',
  ]);
  const [gcpVisible, setGcpVisible] = useState(true);

  const step = activeSaga?.steps.find(s => s.id === stepId);

  if (!step || !activeSaga || !activeProgress) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>Step not found.</Text>
      </SafeAreaView>
    );
  }

  const isFinalStep = stepId === activeSaga.totalSteps;
  const isCompleted = activeProgress.completedSteps.includes(stepId);

  const handleTerminalSubmit = (cmd: string) => {
    setTerminalLines(prev => [...prev, cmd, `Executed: ${cmd}`]);
  };

  const handleConsoleAction = (actionId: string) => {
    setTerminalLines(prev => [...prev, `Action triggered: ${actionId}`]);
  };

  const handleComplete = async () => {
    await completeStep(stepId);

    showAdIfNeeded({
      stepNumber: stepId,
      hasChallenge: !!step.challenge,
      isAfterChallenge: false,
      isFinalStep,
      isPro: hasNoAds,
    });

    if (step.challenge && !activeProgress.completedChallenges.includes(step.challenge.id)) {
      navigation.navigate('Challenge', { sagaId, stepId, challengeId: step.challenge.id });
    } else if (isFinalStep) {
      navigation.navigate('SagaDetail', { sagaId });
    } else {
      navigation.navigate('Step', { sagaId, stepId: stepId + 1 });
    }
  };

  const cloudyMood = isCompleted ? 'happy' : step.type === 'terminal' ? 'idle' : 'idle';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step header */}
        <View style={styles.stepHeader}>
          <View style={styles.stepMeta}>
            <Text style={styles.stepNum}>Step {stepId}</Text>
            <Text style={styles.stepType}>{step.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDesc}>{step.description}</Text>
        </View>

        {/* Cloudy mascot */}
        <View style={styles.cloudyWrap}>
          <Cloudy size={80} animation={cloudyMood} />
        </View>

        {/* Step-type specific UI */}
        {step.type === 'terminal' && (
          <View style={styles.terminalWrap}>
            <NimbusTerminal
              lines={terminalLines}
              inputEnabled={!isCompleted}
              onSubmit={handleTerminalSubmit}
            />
          </View>
        )}

        {step.type === 'ui-interaction' && (
          <NimbusConsole panels={STUB_PANELS} onAction={handleConsoleAction} />
        )}

        {step.type === 'instruction' && (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionText}>{step.description}</Text>
          </View>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} activeOpacity={0.8}>
            <Text style={styles.completeBtnText}>
              {step.challenge ? 'Complete & Face Challenge ⚡' : isFinalStep ? 'Finish Saga 🎉' : 'Mark Complete →'}
            </Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View style={styles.doneCard}>
            <Text style={styles.doneText}>✓ Step completed</Text>
          </View>
        )}
      </ScrollView>

      {/* GCP Annotation */}
      {step.gcpNote && (
        <GCPAnnotation
          text={step.gcpNote}
          visible={gcpVisible}
          stepId={stepId}
          onDismiss={() => setGcpVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  stepHeader: { gap: Spacing.xs },
  stepMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepNum: { ...Typography.footnote, color: Colors.textTertiary },
  stepType: { ...Typography.caption2, color: Colors.primary, fontWeight: '700', letterSpacing: 0.8 },
  stepTitle: { ...Typography.title3, color: Colors.textPrimary },
  stepDesc: { ...Typography.body, color: Colors.textSecondary },
  cloudyWrap: { alignItems: 'center', marginVertical: Spacing.sm },
  terminalWrap: { height: 260 },
  instructionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  instructionText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },
  completeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  completeBtnText: { ...Typography.headline, color: Colors.textPrimary },
  doneCard: {
    backgroundColor: Colors.success + '1A',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  doneText: { ...Typography.headline, color: Colors.success },
  errorText: { ...Typography.body, color: Colors.error, margin: Spacing.lg },
});
