import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { secureGet, secureSet } from '@/utils/storage';
import { logger } from '@/utils/logger';

export type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_annual';

const SECURE_KEY_TIER = 'subscription_tier_v1';

interface MonetizationState {
  currentTier: SubscriptionTier;
  isLoading: boolean;
  initialize: () => Promise<void>;
  hasUnlimitedSignals: () => boolean;
  hasNoAds: () => boolean;
  hasEarlyAccess: () => boolean;
  purchaseMonthly: () => Promise<void>;
  purchaseAnnual: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export const useMonetizationStore = create<MonetizationState>((set, get) => ({
  currentTier: 'free',
  isLoading: false,

  initialize: async () => {
    const tier = await secureGet<SubscriptionTier>(SECURE_KEY_TIER);
    if (tier) set({ currentTier: tier });
  },

  hasUnlimitedSignals: () => {
    const { currentTier } = get();
    return currentTier === 'pro_monthly' || currentTier === 'pro_annual';
  },

  hasNoAds: () => {
    const { currentTier } = get();
    return currentTier === 'pro_monthly' || currentTier === 'pro_annual';
  },

  hasEarlyAccess: () => {
    return get().currentTier === 'pro_annual';
  },

  purchaseMonthly: async () => {
    logger.info('PURCHASE_STUB: pro_monthly');
    // TODO: [IAP] integrate RevenueCat SDK
    // TODO: [IAP] iOS: StoreKit 2 via RevenueCat
    // TODO: [IAP] Android: Google Play Billing via RevenueCat
    // TODO: [SECURITY] validate receipts server-side via Supabase Edge Function
    await secureSet(SECURE_KEY_TIER, 'pro_monthly');
    set({ currentTier: 'pro_monthly' });
  },

  purchaseAnnual: async () => {
    logger.info('PURCHASE_STUB: pro_annual');
    // TODO: [IAP] integrate RevenueCat SDK
    // TODO: [IAP] iOS: StoreKit 2 via RevenueCat
    // TODO: [IAP] Android: Google Play Billing via RevenueCat
    // TODO: [SECURITY] validate receipts server-side via Supabase Edge Function
    await secureSet(SECURE_KEY_TIER, 'pro_annual');
    set({ currentTier: 'pro_annual' });
  },

  restorePurchases: async () => {
    logger.info('PURCHASE_STUB: restore');
    // TODO: [IAP] integrate RevenueCat SDK restore flow
    // TODO: [SECURITY] validate restored receipts server-side
  },
}));

export function useMonetization() {
  return useMonetizationStore(useShallow(state => ({
    currentTier: state.currentTier,
    hasUnlimitedSignals: state.hasUnlimitedSignals,
    hasNoAds: state.hasNoAds,
    hasEarlyAccess: state.hasEarlyAccess,
    purchaseMonthly: state.purchaseMonthly,
    purchaseAnnual: state.purchaseAnnual,
    restorePurchases: state.restorePurchases,
  })));
}
