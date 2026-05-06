export type StepType = 'instruction' | 'terminal' | 'ui-interaction';
export type ChallengeType = 'broken-config' | 'missing-permission' | 'network-rule' | 'code-fix';

export interface Challenge {
  /** Float representing X.5 position, e.g. 3.5 for challenge after step 3 */
  id: number;
  title: string;
  description: string;
  type: ChallengeType;
  brokenCode: string;
  solutionCode: string;
  hints: string[];
  failureMessage: string;
  successMessage: string;
}

export interface SagaStep {
  id: number;
  title: string;
  description: string;
  type: StepType;
  gcpNote?: string;
  challenge?: Challenge;
}

export interface Saga {
  id: string;
  title: string;
  description: string;
  totalSteps: number;
  steps: SagaStep[];
  mascotMood: 'idle' | 'happy' | 'worried';
}

export interface SagaProgress {
  sagaId: string;
  userId: string;
  completedSteps: number[];
  completedChallenges: number[];
  currentStepId: number;
  startedAt: number;
  completedAt: number | null;
}
