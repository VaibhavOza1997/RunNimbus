import { Saga, SagaProgress } from './sagaTypes';
import { saga1 } from './data/saga1';
import { storageGet, storageSet } from '@/utils/storage';
import { logger } from '@/utils/logger';

const ALL_SAGAS: Saga[] = [saga1];

export interface ISagaRepository {
  getSaga(id: string): Promise<Saga>;
  getAllSagas(): Promise<Saga[]>;
  saveProgress(userId: string, progress: SagaProgress): Promise<void>;
  getProgress(userId: string, sagaId: string): Promise<SagaProgress | null>;
}

function progressKey(userId: string, sagaId: string): string {
  return `saga_progress_v1_${userId}_${sagaId}`;
}

export class LocalSagaRepository implements ISagaRepository {
  async getSaga(id: string): Promise<Saga> {
    const saga = ALL_SAGAS.find(s => s.id === id);
    if (!saga) throw new Error(`Saga "${id}" not found`);
    return saga;
  }

  async getAllSagas(): Promise<Saga[]> {
    return ALL_SAGAS;
  }

  async saveProgress(userId: string, progress: SagaProgress): Promise<void> {
    await storageSet(progressKey(userId, progress.sagaId), progress);
  }

  async getProgress(userId: string, sagaId: string): Promise<SagaProgress | null> {
    return storageGet<SagaProgress>(progressKey(userId, sagaId));
  }
}

export class SupabaseSagaRepository implements ISagaRepository {
  // TODO: [SUPABASE] inject SupabaseClient, implement with supabase.from('sagas')
  async getSaga(_id: string): Promise<Saga> {
    throw new Error('SupabaseSagaRepository not yet implemented');
  }

  async getAllSagas(): Promise<Saga[]> {
    throw new Error('SupabaseSagaRepository not yet implemented');
  }

  // TODO: [SUPABASE] implement with supabase.from('saga_progress').upsert(...)
  async saveProgress(_userId: string, _progress: SagaProgress): Promise<void> {
    throw new Error('SupabaseSagaRepository not yet implemented');
  }

  // TODO: [SUPABASE] implement with supabase.from('saga_progress').select().eq('user_id', userId)
  async getProgress(_userId: string, _sagaId: string): Promise<SagaProgress | null> {
    throw new Error('SupabaseSagaRepository not yet implemented');
  }
}

export const sagaRepository: ISagaRepository = new LocalSagaRepository();

export function createInitialProgress(userId: string, sagaId: string): SagaProgress {
  logger.debug(`Creating initial progress for saga ${sagaId}`);
  return {
    sagaId,
    userId,
    completedSteps: [],
    completedChallenges: [],
    currentStepId: 1,
    startedAt: Date.now(),
    completedAt: null,
  };
}
