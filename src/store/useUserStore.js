import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Persisted localStorage keys owned by the app's data stores. */
const DATA_KEYS = [
  'gue-ngekost-finance',
  'gue-ngekost-food',
  'gue-ngekost-packing',
];

/**
 * User profile + first-run onboarding state.
 * No backend, no login — localStorage via zustand persist.
 */
export const useUserStore = create(
  persist(
    (set) => ({
      fullName: '',
      onboarded: false,
      setFullName: (fullName) => set({ fullName: fullName.trim() }),
      completeOnboarding: (fullName) =>
        set({ fullName: fullName.trim(), onboarded: true }),
      /** Wipe all financial/food/packing data (keeps profile + preferences). */
      resetData: () => {
        DATA_KEYS.forEach((k) => localStorage.removeItem(k));
        if (typeof window !== 'undefined') window.location.reload();
      },
    }),
    { name: 'gue-ngekost-user' }
  )
);
