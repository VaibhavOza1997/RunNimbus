import { create } from 'zustand';
import { authRepository, User } from './authRepository';
import { logger } from '@/utils/logger';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: true, // stub: always authenticated for local dev
  isLoading: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = await authRepository.getCurrentUser();
      set({ currentUser: user, isAuthenticated: user !== null, isLoading: false });
    } catch (err) {
      logger.error('Auth initialization failed', err);
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await authRepository.signOut();
      set({ currentUser: null, isAuthenticated: false });
    } catch (err) {
      logger.error('Sign out failed', err);
    }
  },
}));

export function useCurrentUser() {
  return useAuthStore(state => state.currentUser);
}

export function useIsAuthenticated() {
  return useAuthStore(state => state.isAuthenticated);
}
