import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSagaStore } from '@/services/saga/sagaStore';
import Cloudy from '@/components/cloudy/Cloudy';
import { showAdIfNeeded } from '@/services/monetization/adEngine';
import { useMonetizationStore } from '@/services/monetization/monetizationStore';
import { sanitizeChallengeInput } from '@/utils/validation';
import { Colors, Spacing, Radius, Typography } from '@/theme';
import type { PlayStackParamList } from '@/navigation/PlayStackNavigator';

type RouteProps = RouteProp<PlayStackParamList, 'Challenge'>;
type Nav = NativeStackNavigationProp<PlayStackParamList, 'Challenge'>;

export default function ChallengeScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { sagaId, stepId, challengeId } = route.params;

  const { activeSaga, activeProgress, completeChallenge } = useSagaStore();
  const hasNoAds = useMonetizationStore(s => s.hasNoAds());

  const [answer, setAnswer] = useState('');
  const [hintIndex, setHintIndex] = useState(-1);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [attempts, setAttempts] = useState(0);

  const step = activeSaga?.steps.find(s => s.id === stepId);
  const challenge = step?.challenge;

  if (!challenge || !activeSaga) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>Challenge not found.</Text>
      </SafeAreaView>
    );
  }

  const isAlreadyCompleted = activeProgress?.completedChallenges.includes(challengeId) ?? false;
  const isFinalStep = stepId === activeSaga.totalSteps;

  const handleSubmit = async () => {
    const sanitized = sanitizeChallengeInput(answer.trim());
    const correct = sanitized === challenge.solutionCode.trim();

    setAttempts(prev => prev + 1);

    if (correct) {
      setResult('success');
      await completeChallenge(challengeId);

      showAdIfNeeded({
        stepNumber: stepId,
        hasChallenge: true,
        isAfterChallenge: true,
        isFinalStep,
        isPro: hasNoAds,
      });
    } else {
      setResult('fail');
      if (hintIndex < challenge.hints.length - 1) {
        setHintIndex(prev => prev + 1);
      }
    }
  };

  const handleContinue = () => {
    if (isFinalStep) {
      navigation.navigate('SagaDetail', { sagaId });
    } else {
      navigation.navigate('Step', { sagaId, stepId: stepId + 1 });
    }
  };

  const cloudyMood =
    result === 'success' ? 'celebrate' : result === 'fail' ? 'worried' : 'idle';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.tag}>⚡ CHALLENGE {challengeId}</Text>
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>

        <View style={styles.cloudyRow}>
          <Cloudy size={70} animation={cloudyMood} />
          {result !== 'idle' && (
            <View style={styles.feedbackBubble}>
              <Text style={[styles.feedbackText, result === 'success' ? styles.successText : styles.failText]}>
                {result === 'success' ? challenge.successMessage : challenge.failureMessage}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Broken code:</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{challenge.brokenCode}</Text>
          </View>
        </View>

        {!isAlreadyCompleted && result !== 'success' && (
          <>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Your fix:</Text>
              <TextInput
                style={styles.codeInput}
                value={answer}
                onChangeText={text => setAnswer(sanitizeChallengeInput(text))}
                multiline
                autoCorrect={false}
                autoCapitalize="none"
                spellCheck={false}
                placeholderTextColor={Colors.textTertiary}
                placeholder="Type your corrected code here..."
                selectionColor={Colors.primary}
              />
            </View>

            {hintIndex >= 0 && (
              <View style={styles.hintCard}>
                <Text style={styles.hintLabel}>Hint {hintIndex + 1}/{challenge.hints.length}</Text>
                <Text style={styles.hintText}>{challenge.hints[hintIndex]}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Submit Fix</Text>
              </TouchableOpacity>

              {attempts > 0 && hintIndex < challenge.hints.length - 1 && (
                <TouchableOpacity
                  style={styles.hintBtn}
                  onPress={() => setHintIndex(prev => prev + 1)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.hintBtnText}>
                    Show Hint ({hintIndex + 2}/{challenge.hints.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {(result === 'success' || isAlreadyCompleted) && (
          <>
            {isAlreadyCompleted && (
              <View style={styles.solutionSection}>
                <Text style={styles.codeLabel}>Solution:</Text>
                <View style={styles.codeBlock}>
                  <Text style={[styles.codeText, { color: Colors.success }]}>
                    {challenge.solutionCode}
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
              <Text style={styles.continueBtnText}>
                {isFinalStep ? 'Finish Saga 🎉' : 'Next Step →'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxxl },
  header: { gap: Spacing.xs },
  tag: { ...Typography.caption1, color: Colors.warning, fontWeight: '700', letterSpacing: 1 },
  title: { ...Typography.title3, color: Colors.textPrimary },
  description: { ...Typography.body, color: Colors.textSecondary },
  cloudyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  feedbackBubble: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  feedbackText: { ...Typography.subheadline },
  successText: { color: Colors.success },
  failText: { color: Colors.error },
  codeSection: { gap: Spacing.xs },
  codeLabel: { ...Typography.footnote, color: Colors.textTertiary, fontWeight: '600' },
  codeBlock: {
    backgroundColor: Colors.terminalBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  codeText: { ...Typography.terminal, color: Colors.terminalText },
  inputSection: { gap: Spacing.xs },
  inputLabel: { ...Typography.footnote, color: Colors.textTertiary, fontWeight: '600' },
  codeInput: {
    ...Typography.terminal,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlignVertical: 'top',
  },
  hintCard: {
    backgroundColor: Colors.warning + '1A',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    gap: 4,
  },
  hintLabel: { ...Typography.caption1, color: Colors.warning, fontWeight: '700' },
  hintText: { ...Typography.subheadline, color: Colors.textSecondary },
  actions: { gap: Spacing.sm },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  submitBtnText: { ...Typography.headline, color: Colors.textPrimary },
  hintBtn: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintBtnText: { ...Typography.callout, color: Colors.textSecondary },
  continueBtn: {
    backgroundColor: Colors.success,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  continueBtnText: { ...Typography.headline, color: Colors.textPrimary },
  solutionSection: { gap: Spacing.xs },
  errorText: { ...Typography.body, color: Colors.error, margin: Spacing.lg },
});
