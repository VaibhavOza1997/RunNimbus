export interface SignalSlot {
  id: number; // 1–5
  full: boolean;
  emptyAt: number | null; // Unix ms timestamp when slot became empty; null if full
}

export interface SignalsState {
  slots: SignalSlot[];
  isPro: boolean;
  consumeSignal: () => boolean;
  refillSignalFromAd: () => void;
  activatePro: () => void;
  deactivatePro: () => void;
  syncOnAppOpen: () => Promise<void>;
}
