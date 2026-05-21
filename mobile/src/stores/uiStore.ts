import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Language } from '@/types/models';

type UIState = {
  language: Language;
  onboardingComplete: boolean;
  setLanguage: (language: Language) => void;
  completeOnboarding: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: 'en',
      onboardingComplete: false,
      setLanguage: (language) => set({ language }),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    {
      name: 'medihub.ui.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
