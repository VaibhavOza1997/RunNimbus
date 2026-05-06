export interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  sagaTitle: string;
  stepCompleted: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalSagasCompleted: number;
  score: number;
}

export interface ISocialRepository {
  getFeed(userId: string): Promise<FeedItem[]>;
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}

export class LocalSocialRepository implements ISocialRepository {
  async getFeed(_userId: string): Promise<FeedItem[]> {
    // TODO: [SOCIAL] return stub feed items when social screen is built
    return [];
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // TODO: [SOCIAL] return stub leaderboard entries when screen is built
    return [];
  }
}

export class SupabaseSocialRepository implements ISocialRepository {
  // TODO: [SUPABASE] implement with supabase.from('feed').select(...)
  async getFeed(_userId: string): Promise<FeedItem[]> {
    throw new Error('SupabaseSocialRepository not yet implemented');
  }

  // TODO: [SUPABASE] implement with supabase.from('leaderboard').select(...)
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    throw new Error('SupabaseSocialRepository not yet implemented');
  }
}

export const socialRepository: ISocialRepository = new LocalSocialRepository();
