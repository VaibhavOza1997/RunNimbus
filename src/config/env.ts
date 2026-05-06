import Constants from 'expo-constants';

interface AppExtra {
  appEnv: string;
  admobIosAppId: string;
  admobAndroidAppId: string;
  admobInterstitialIos: string;
  admobInterstitialAndroid: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  revenuecatIosKey: string;
  revenuecatAndroidKey: string;
}

function getExtra(): AppExtra {
  // Falls back to safe defaults when running outside Expo (Jest, CI, etc.)
  const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppExtra>;
  return {
    appEnv: extra.appEnv ?? process.env['APP_ENV'] ?? 'development',
    admobIosAppId: extra.admobIosAppId ?? '',
    admobAndroidAppId: extra.admobAndroidAppId ?? '',
    admobInterstitialIos: extra.admobInterstitialIos ?? '',
    admobInterstitialAndroid: extra.admobInterstitialAndroid ?? '',
    supabaseUrl: extra.supabaseUrl ?? '',
    supabaseAnonKey: extra.supabaseAnonKey ?? '',
    revenuecatIosKey: extra.revenuecatIosKey ?? '',
    revenuecatAndroidKey: extra.revenuecatAndroidKey ?? '',
  };
}

/** Call at app startup (App.tsx) to validate required production config is present. */
export function validateEnvOrThrow(): void {
  if (env.appEnv === 'production') {
    if (!env.supabaseUrl) throw new Error('[ENV] SUPABASE_URL is required in production');
    if (!env.supabaseAnonKey) throw new Error('[ENV] SUPABASE_ANON_KEY is required in production');
  }
}

export const env = getExtra();
export const isDev = env.appEnv === 'development';
export const isProd = env.appEnv === 'production';
