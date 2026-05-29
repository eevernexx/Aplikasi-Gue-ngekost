import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { format, subDays } from 'date-fns';

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

const dayKey = (daysAgo) => format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');

const seedEntries = () => {
  const rows = [
    // [daysAgo, name, time, category, cost, calories, note]
    [0, 'Bubur ayam', '07:30', 'warung', 12000, 350, 'sarapan deket kost'],
    [0, 'Ayam geprek', '12:30', 'restoran', 25000, 650, 'level 2'],
    [0, 'Kopi susu', '16:00', 'ojol', 22000, 180, ''],
    [1, 'Indomie', '08:00', 'masak', 4000, 400, 'pakai telur'],
    [1, 'Nasi padang', '13:00', 'warung', 18000, 700, 'rendang'],
    [1, 'Bakso', '19:30', 'warung', 15000, 450, ''],
    [2, 'Roti bakar', '09:00', 'warung', 10000, 300, ''],
    [2, 'Nasi goreng', '20:00', 'ojol', 20000, 600, 'extra telur'],
    [3, 'Kopi susu', '10:00', 'restoran', 23000, 180, 'nugas di cafe'],
    [3, 'Pecel lele', '19:00', 'warung', 17000, 550, ''],
    [4, 'Indomie', '12:00', 'masak', 4000, 400, 'rebus + sayur'],
    [4, 'Soto', '18:30', 'warung', 16000, 420, ''],
    [5, 'Gado-gado', '13:30', 'warung', 15000, 480, ''],
    [6, 'Nasi kuning', '08:30', 'warung', 13000, 500, 'lengkap'],
    [6, 'Mie goreng', '20:00', 'masak', 5000, 450, ''],
  ];
  return rows.map(([d, name, time, category, cost, calories, note]) => ({
    id: nanoid(),
    name,
    time,
    date: dayKey(d),
    category,
    cost,
    calories,
    note,
  }));
};

export const useFoodStore = create(
  persist(
    (set) => ({
      entries: seedEntries(),
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
      version: 1,
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);

export const useFoodActions = () => useFoodStore((s) => s.actions);
