/**
 * Central API client. All network requests must flow through here.
 *
 * Current state: stub with interceptor placeholders.
 * TODO: [SUPABASE] replace baseUrl and inject Supabase client when backend is ready.
 * TODO: [SECURITY] add certificate pinning via react-native-ssl-pinning.
 * TODO: [SECURITY] add request signing for sensitive endpoints.
 */
import { logger } from '@/utils/logger';
import { secureGet } from '@/utils/storage';

const SECURE_KEY_AUTH_TOKEN = 'auth_token_v1';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

async function buildHeaders(skipAuth: boolean): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!skipAuth) {
    // TODO: [AUTH] inject JWT from SecureStore — never from AsyncStorage
    const token = await secureGet<string>(SECURE_KEY_AUTH_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  // TODO: [SUPABASE] replace with real base URL from env
  const baseUrl = 'https://placeholder.supabase.co';
  const url = `${baseUrl}${path}`;

  try {
    const headers = await buildHeaders(skipAuth);
    const response = await fetch(url, { ...fetchOptions, headers });

    if (!response.ok) {
      logger.warn(`API ${options.method ?? 'GET'} ${path} → ${response.status}`);
      return { data: null, error: `HTTP ${response.status}`, status: response.status };
    }

    const data = (await response.json()) as T;
    return { data, error: null, status: response.status };
  } catch (err) {
    logger.error(`API request failed: ${path}`, err);
    return { data: null, error: 'Network error', status: 0 };
  }
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string, opts?: RequestOptions) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};
