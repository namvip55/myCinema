import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface AuthState {
  pinHash: string | null;
  isLocked: boolean;
  isFirstTime: boolean;
  isBiometricsEnabled: boolean;

  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  setBiometricsEnabled: (enabled: boolean) => void;
  lock: () => void;
  unlock: () => void;
  resetPin: () => void;
}

async function hashPin(pin: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `myCinema_salt_${pin}`
  );
  return digest;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      pinHash: null,
      isLocked: true,
      isFirstTime: true,
      isBiometricsEnabled: false,

      setPin: async (pin: string) => {
        const hash = await hashPin(pin);
        set({ pinHash: hash, isFirstTime: false, isLocked: false });
      },

      verifyPin: async (pin: string) => {
        const hash = await hashPin(pin);
        const valid = hash === get().pinHash;
        if (valid) {
          set({ isLocked: false });
        }
        return valid;
      },

      setBiometricsEnabled: (enabled: boolean) => {
        set({ isBiometricsEnabled: enabled });
      },

      lock: () => set({ isLocked: true }),
      unlock: () => set({ isLocked: false }),

      resetPin: () => set({ pinHash: null, isFirstTime: true, isLocked: true, isBiometricsEnabled: false }),
    }),
    {
      name: 'mycinema-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pinHash: state.pinHash,
        isFirstTime: state.isFirstTime,
        isBiometricsEnabled: state.isBiometricsEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        // Always start locked after app restart
        if (state) {
          state.isLocked = true;
        }
      },
    }
  )
);
