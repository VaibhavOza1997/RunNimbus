import { shouldShowAd, AdParams } from '../adEngine';

function params(overrides: Partial<AdParams>): AdParams {
  return {
    stepNumber: 1,
    hasChallenge: false,
    isAfterChallenge: false,
    isFinalStep: false,
    isPro: false,
    ...overrides,
  };
}

describe('shouldShowAd', () => {
  // Pro users never see ads
  describe('Pro user', () => {
    it('never shows ad at a 5-multiple step', () => {
      expect(shouldShowAd(params({ stepNumber: 5, isPro: true }))).toBe(false);
    });

    it('never shows ad at final step', () => {
      expect(shouldShowAd(params({ stepNumber: 15, isFinalStep: true, isPro: true }))).toBe(false);
    });

    it('never shows ad after a challenge', () => {
      expect(
        shouldShowAd(params({ stepNumber: 5, hasChallenge: true, isAfterChallenge: true, isPro: true }))
      ).toBe(false);
    });
  });

  // Non-multiple-of-5 steps
  describe('Non-5-multiple steps', () => {
    it('does not show ad at step 1', () => {
      expect(shouldShowAd(params({ stepNumber: 1 }))).toBe(false);
    });

    it('does not show ad at step 3', () => {
      expect(shouldShowAd(params({ stepNumber: 3 }))).toBe(false);
    });

    it('does not show ad at step 7 with challenge', () => {
      expect(shouldShowAd(params({ stepNumber: 7, hasChallenge: true, isAfterChallenge: true }))).toBe(false);
    });
  });

  // 5-multiple step WITHOUT a challenge
  describe('5-multiple step, no challenge', () => {
    it('shows ad after step 5', () => {
      expect(shouldShowAd(params({ stepNumber: 5, hasChallenge: false, isAfterChallenge: false }))).toBe(true);
    });

    it('shows ad after step 10', () => {
      expect(shouldShowAd(params({ stepNumber: 10, hasChallenge: false, isAfterChallenge: false }))).toBe(true);
    });

    it('does NOT show ad "after challenge" when there is no challenge', () => {
      // isAfterChallenge=true but no challenge — no ad since it's logically invalid position
      expect(shouldShowAd(params({ stepNumber: 5, hasChallenge: false, isAfterChallenge: true }))).toBe(false);
    });
  });

  // 5-multiple step WITH a challenge
  describe('5-multiple step, has challenge', () => {
    it('does NOT show ad after the step itself', () => {
      expect(
        shouldShowAd(params({ stepNumber: 5, hasChallenge: true, isAfterChallenge: false }))
      ).toBe(false);
    });

    it('shows ad after the challenge (X.5)', () => {
      expect(
        shouldShowAd(params({ stepNumber: 5, hasChallenge: true, isAfterChallenge: true }))
      ).toBe(true);
    });

    it('shows ad after challenge at step 10', () => {
      expect(
        shouldShowAd(params({ stepNumber: 10, hasChallenge: true, isAfterChallenge: true }))
      ).toBe(true);
    });
  });

  // Final step rules
  describe('Final step', () => {
    it('shows ad after final step with no challenge', () => {
      expect(
        shouldShowAd(params({ stepNumber: 14, isFinalStep: true, hasChallenge: false }))
      ).toBe(true);
    });

    it('shows ad after challenge on final step that has a challenge', () => {
      expect(
        shouldShowAd(params({ stepNumber: 15, isFinalStep: true, hasChallenge: true, isAfterChallenge: true }))
      ).toBe(true);
    });

    it('does NOT show ad directly after final step when it has a challenge', () => {
      expect(
        shouldShowAd(params({ stepNumber: 15, isFinalStep: true, hasChallenge: true, isAfterChallenge: false }))
      ).toBe(false);
    });

    it('final step at 5-multiple without challenge shows ad (final rule takes precedence)', () => {
      expect(
        shouldShowAd(params({ stepNumber: 15, isFinalStep: true, hasChallenge: false }))
      ).toBe(true);
    });

    it('pro user never sees ad on final step', () => {
      expect(
        shouldShowAd(params({ stepNumber: 15, isFinalStep: true, hasChallenge: false, isPro: true }))
      ).toBe(false);
    });
  });
});
