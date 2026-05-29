import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export const FOOD_CATEGORIES = [
  { key: 'masak', label: 'Masak sendiri', emoji: '🏠' },
  { key: 'warung', label: 'Beli warung', emoji: '🛒' },
  { key: 'restoran', label: 'Beli resto', emoji: '🏪' },
  { key: 'ojol', label: 'GoFood/Shopeefood', emoji: '🛵' },
];

export const FOOD_SUGGESTIONS = [
  'Nasi goreng',
  'Mie goreng',
  'Ayam geprek',
  'Bakso',
  'Indomie',
  'Nasi padang',
  'Soto',
  'Gado-gado',
  'Pecel lele',
  'Nasi kuning',
  'Bubur ayam',
  'Roti bakar',
  'Kopi susu',
];

export const useFoodStore = create(
  persist(
    (set) => ({
      entries: [],
      actions: {
        addEntry: (entry) =>
          set((state) => ({
            entries: [{ id: nanoid(), ...entry }, ...state.entries],
          })),
        deleteEntry: (id) =>
          set((state) => ({
            entries: state.entries.filter((e) => e.id !== id),
          })),
      },
    }),
    {
      name: 'gue-ngekost-food',
      version: 2,
      // Bumped to v2 to wipe the old seed/demo data so the app starts clean.
      migrate: () => ({ entries: [] }),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);

export const useFoodActions = () => useFoodStore((s) => s.actions);
