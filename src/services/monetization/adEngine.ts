import { logger } from '@/utils/logger';

export interface AdParams {
  stepNumber: number;
  hasChallenge: boolean;
  isAfterChallenge: boolean;
  isFinalStep: boolean;
  isPro: boolean;
}

/**
 * Determines whether an ad should be shown at a given point in saga progression.
 *
 * Rules:
 * - Pro users never see ads
 * - Ads only show at 5-multiple steps (5, 10, 15...)
 * - If a 5-multiple step has no challenge: ad shows after the step
 * - If a 5-multiple step has a challenge: ad shows after the challenge (X.5), not after the step
 * - Ad always shows after the final step of a saga regardless of step number
 */
export function shouldShowAd(params: AdParams): boolean {
  const { stepNumber, hasChallenge, isAfterChallenge, isFinalStep, isPro } = params;

  if (isPro) return false;

  // Final step always shows an ad (after the challenge if one exists, otherwise after the step)
  if (isFinalStep) {
    if (hasChallenge) return isAfterChallenge;
    return true;
  }

  const isMultipleOfFive = stepNumber % 5 === 0;
  if (!isMultipleOfFive) return false;

  // 5-multiple with a challenge: show ad only after the challenge, not after the step
  if (hasChallenge) return isAfterChallenge;

  // 5-multiple without a challenge: show ad after the step
  return !isAfterChallenge;
}

export function showAdIfNeeded(params: AdParams): void {
  if (!shouldShowAd(params)) return;

  const position = params.isAfterChallenge
    ? `step ${params.stepNumber}.5 (challenge)`
    : `step ${params.stepNumber}`;

  logger.info(`AD_STUB: showing ad at ${position}`);
  // TODO: [ADS] integrate Google AdMob SDK
  // TODO: [ADS] interstitial ad unit IDs from app.config.ts env vars — never hardcoded
  // TODO: [SECURITY] validate ad completion server-side before crediting signal refills
}
