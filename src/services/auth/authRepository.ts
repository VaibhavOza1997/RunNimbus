export interface User {
  id: string;
  name: string;
  tier: 'free' | 'pro_monthly' | 'pro_annual';
}

export interface IAuthRepository {
  getCurrentUser(): Promise<User | null>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
}

// Hardcoded stub user — replaced by Supabase Auth when backend is ready
const STUB_USER: User = {
  id: 'local-user-001',
  name: 'Cloud Engineer',
  tier: 'free',
};

export class LocalAuthRepository implements IAuthRepository {
  async getCurrentUser(): Promise<User | null> {
    return STUB_USER;
  }

  async signIn(_email: string, _password: string): Promise<User> {
    // TODO: [AUTH] implement SupabaseAuthRepository.signIn
    return STUB_USER;
  }

  async signOut(): Promise<void> {
    // TODO: [AUTH] implement SupabaseAuthRepository.signOut
    // TODO: [SECURITY] clear JWT from SecureStore on sign out
  }
}

export class SupabaseAuthRepository implements IAuthRepository {
  // TODO: [AUTH] implement SupabaseAuthRepository
  // TODO: [SECURITY] implement token refresh flow
  // TODO: [SECURITY] store JWT in SecureStore, never AsyncStorage
  async getCurrentUser(): Promise<User | null> {
    throw new Error('SupabaseAuthRepository not yet implemented');
  }

  async signIn(_email: string, _password: string): Promise<User> {
    throw new Error('SupabaseAuthRepository not yet implemented');
  }

  async signOut(): Promise<void> {
    throw new Error('SupabaseAuthRepository not yet implemented');
  }
}

export const authRepository: IAuthRepository = new LocalAuthRepository();
