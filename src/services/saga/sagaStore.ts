import { create } from 'zustand';
import { Saga, SagaProgress } from './sagaTypes';
import { sagaRepository, createInitialProgress } from './sagaRepository';
import { logger } from '@/utils/logger';

interface SagaState {
  sagas: Saga[];
  activeSaga: Saga | null;
  activeProgress: SagaProgress | null;
  isLoading: boolean;
  loadAllSagas: () => Promise<void>;
  startSaga: (sagaId: string, userId: string) => Promise<void>;
  completeStep: (stepId: number) => Promise<void>;
  completeChallenge: (challengeId: number) => Promise<void>;
}

export const useSagaStore = create<SagaState>((set, get) => ({
  sagas: [],
  activeSaga: null,
  activeProgress: null,
  isLoading: false,

  loadAllSagas: async () => {
    set({ isLoading: true });
    try {
      const sagas = await sagaRepository.getAllSagas();
      set({ sagas, isLoading: false });
    } catch (err) {
      logger.error('Failed to load sagas', err);
      set({ isLoading: false });
    }
  },

  startSaga: async (sagaId, userId) => {
    try {
      const saga = await sagaRepository.getSaga(sagaId);
      let progress = await sagaRepository.getProgress(userId, sagaId);
      if (!progress) {
        progress = createInitialProgress(userId, sagaId);
        await sagaRepository.saveProgress(userId, progress);
      }
      set({ activeSaga: saga, activeProgress: progress });
    } catch (err) {
      logger.error(`Failed to start saga ${sagaId}`, err);
    }
  },

  completeStep: async (stepId) => {
    const { activeProgress, activeSaga } = get();
    if (!activeProgress || !activeSaga) return;

    if (activeProgress.completedSteps.includes(stepId)) return;

    const nextStepId = stepId + 1;
    const isLastStep = stepId >= activeSaga.totalSteps;

    const updated: SagaProgress = {
      ...activeProgress,
      completedSteps: [...activeProgress.completedSteps, stepId],
      currentStepId: isLastStep ? stepId : nextStepId,
      completedAt: isLastStep ? Date.now() : null,
    };

    await sagaRepository.saveProgress(activeProgress.userId, updated);
    set({ activeProgress: updated });
  },

  completeChallenge: async (challengeId) => {
    const { activeProgress } = get();
    if (!activeProgress) return;

    if (activeProgress.completedChallenges.includes(challengeId)) return;

    const updated: SagaProgress = {
      ...activeProgress,
      completedChallenges: [...activeProgress.completedChallenges, challengeId],
    };

    await sagaRepository.saveProgress(activeProgress.userId, updated);
    set({ activeProgress: updated });
  },
}));

export function useActiveSaga() {
  return useSagaStore(state => state.activeSaga);
}

export function useActiveProgress() {
  return useSagaStore(state => state.activeProgress);
}
