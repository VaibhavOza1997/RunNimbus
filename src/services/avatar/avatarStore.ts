import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

interface AvatarState {
  selectedSkin: string;
  unlockedSkins: string[];
  equippedAccessory: string | null;
  equipSkin: (skin: string) => void;
  equipAccessory: (accessory: string | null) => void;
  unlockSkin: (skin: string) => void;
}

export const useAvatarStore = create<AvatarState>(set => ({
  selectedSkin: 'default',
  unlockedSkins: ['default'],
  equippedAccessory: null,

  equipSkin: (skin) =>
    set(state => ({
      selectedSkin: state.unlockedSkins.includes(skin) ? skin : state.selectedSkin,
    })),

  equipAccessory: (accessory) => set({ equippedAccessory: accessory }),

  // TODO: [AVATAR] wire to purchase flow when shop is built
  unlockSkin: (skin) =>
    set(state => ({
      unlockedSkins: state.unlockedSkins.includes(skin)
        ? state.unlockedSkins
        : [...state.unlockedSkins, skin],
    })),
}));

export function useAvatar() {
  return useAvatarStore(useShallow(state => ({
    selectedSkin: state.selectedSkin,
    unlockedSkins: state.unlockedSkins,
    equippedAccessory: state.equippedAccessory,
    equipSkin: state.equipSkin,
    equipAccessory: state.equipAccessory,
    unlockSkin: state.unlockSkin,
  })));
}
