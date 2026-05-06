import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { SignalSlot, SignalsState } from './signalsTypes';
import { storageGet, storageSet } from '@/utils/storage';
import { MAX_SIGNALS, SIGNAL_REFILL_HOURS } from '@/config/pricing';
import { logger } from '@/utils/logger';

const STORAGE_KEY = 'signals_slots_v1';
const REFILL_MS = SIGNAL_REFILL_HOURS * 60 * 60 * 1000;

function makeFullSlots(): SignalSlot[] {
  return Array.from({ length: MAX_SIGNALS }, (_, i) => ({
    id: i + 1,
    full: true,
    emptyAt: null,
  }));
}

/**
 * Given persisted slots and current time, credit completed 8-hour refills.
 * Never overshoots MAX_SIGNALS.
 */
function applyElapsedRefills(slots: SignalSlot[], now: number): SignalSlot[] {
  return slots.map(slot => {
    if (slot.full || slot.emptyAt === null) return slot;
    const elapsed = now - slot.emptyAt;
    if (elapsed >= REFILL_MS) {
      return { ...slot, full: true, emptyAt: null };
    }
    return slot;
  });
}

export const useSignalsStore = create<SignalsState>((set, get) => ({
  slots: makeFullSlots(),
  isPro: false,

  consumeSignal: () => {
    const { slots, isPro } = get();
    if (isPro) return true;

    const slotIndex = slots.findIndex(s => s.full);
    if (slotIndex === -1) {
      logger.debug('No signals available');
      return false;
    }

    const now = Date.now();
    const updated = slots.map((s, i) =>
      i === slotIndex ? { ...s, full: false, emptyAt: now } : s
    );

    void storageSet(STORAGE_KEY, updated);
    set({ slots: updated });
    return true;
  },

  refillSignalFromAd: () => {
    const { slots } = get();

    // Find the empty slot with the oldest (smallest) emptyAt timestamp
    const emptySlots = slots.filter(s => !s.full && s.emptyAt !== null);
    if (emptySlots.length === 0) return;

    const oldest = emptySlots.reduce((a, b) =>
      (a.emptyAt as number) < (b.emptyAt as number) ? a : b
    );

    const updated = slots.map(s =>
      s.id === oldest.id ? { ...s, full: true, emptyAt: null } : s
    );

    void storageSet(STORAGE_KEY, updated);
    set({ slots: updated });
    logger.debug(`Signal refilled from ad — slot ${oldest.id}`);
  },

  activatePro: () => {
    // Pro clears all emptyAt timestamps — timers stop while subscribed
    const cleared = makeFullSlots();
    void storageSet(STORAGE_KEY, cleared);
    set({ slots: cleared, isPro: true });
    logger.info('Pro activated — signals unlimited');
  },

  deactivatePro: () => {
    // On lapse: start fresh with 5 full slots
    const fresh = makeFullSlots();
    void storageSet(STORAGE_KEY, fresh);
    set({ slots: fresh, isPro: false });
    logger.info('Pro deactivated — signals reset to 5 full');
  },

  syncOnAppOpen: async () => {
    try {
      const persisted = await storageGet<SignalSlot[]>(STORAGE_KEY);
      if (!persisted) {
        set({ slots: makeFullSlots() });
        return;
      }

      const now = Date.now();
      const credited = applyElapsedRefills(persisted, now);

      // Enforce invariant: never exceed MAX_SIGNALS full slots
      const fullCount = credited.filter(s => s.full).length;
      if (fullCount > MAX_SIGNALS) {
        logger.warn('Signal count exceeded MAX_SIGNALS during sync — resetting');
        set({ slots: makeFullSlots() });
        return;
      }

      await storageSet(STORAGE_KEY, credited);
      set({ slots: credited });
      logger.debug(`Signals synced on app open — ${fullCount}/${MAX_SIGNALS} full`);
    } catch (err) {
      logger.error('Failed to sync signals', err);
    }
  },
}));

export function useSignals() {
  return useSignalsStore(useShallow(state => ({
    slots: state.slots,
    isPro: state.isPro,
    consumeSignal: state.consumeSignal,
    refillSignalFromAd: state.refillSignalFromAd,
    activatePro: state.activatePro,
    deactivatePro: state.deactivatePro,
    syncOnAppOpen: state.syncOnAppOpen,
  })));
}
