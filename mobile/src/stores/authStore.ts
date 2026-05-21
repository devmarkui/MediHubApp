import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { configureAuth } from '@/api/client';
import type { Patient } from '@/types/models';
import { logger } from '@/utils/logger';

const TOKEN_KEY = 'medihub.auth.token';
const PATIENT_KEY = 'medihub.auth.patient';

type AuthState = {
  token: string | null;
  patient: Patient | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, patient: Patient) => Promise<void>;
  updatePatient: (patch: Partial<Patient>) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  patient: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const patientRaw = await SecureStore.getItemAsync(PATIENT_KEY);
      const patient: Patient | null = patientRaw ? (JSON.parse(patientRaw) as Patient) : null;
      set({ token, patient, hydrated: true });
    } catch (e) {
      logger.warn('authStore.hydrate.failed', { e: String(e) });
      set({ hydrated: true });
    }
  },
  setSession: async (token, patient) => {
    set({ token, patient });
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(PATIENT_KEY, JSON.stringify(patient));
  },
  updatePatient: async (patch) => {
    const current = get().patient;
    if (!current) return;
    const next = { ...current, ...patch };
    set({ patient: next });
    await SecureStore.setItemAsync(PATIENT_KEY, JSON.stringify(next));
  },
  signOut: async () => {
    set({ token: null, patient: null });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(PATIENT_KEY);
  },
}));

// Wire the axios client to the auth store.
configureAuth(
  () => useAuthStore.getState().token,
  () => {
    void useAuthStore.getState().signOut();
  },
);
