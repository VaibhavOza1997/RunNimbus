/**
 * Storage abstraction layer.
 *
 * RULES — enforced here so components never call storage APIs directly:
 *   AsyncStorage  → non-sensitive user data (progress, preferences, UI state)
 *   SecureStore   → sensitive data (auth tokens, subscription status, financial data)
 *
 * Components and services import ONLY from this module — never from AsyncStorage or SecureStore directly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { logger } from './logger';

// ─── Async Storage (non-sensitive) ───────────────────────────────────────────

export async function storageGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.error(`storageGet failed for key "${key}"`, err);
    return null;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    logger.error(`storageSet failed for key "${key}"`, err);
  }
}

export async function storageRemove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    logger.error(`storageRemove failed for key "${key}"`, err);
  }
}

// ─── Secure Store (sensitive data only) ──────────────────────────────────────

export async function secureGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.error(`secureGet failed for key "${key}"`, err);
    return null;
  }
}

export async function secureSet<T>(key: string, value: T): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (err) {
    logger.error(`secureSet failed for key "${key}"`, err);
  }
}

export async function secureRemove(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (err) {
    logger.error(`secureRemove failed for key "${key}"`, err);
  }
}
