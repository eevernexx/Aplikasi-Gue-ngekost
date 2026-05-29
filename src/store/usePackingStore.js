import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { addDays } from 'date-fns';

export const PACKING_CATEGORIES = [
  { key: 'Pakaian', emoji: '👕' },
  { key: 'Toiletries', emoji: '🧴' },
  { key: 'Dokumen', emoji: '📄' },
  { key: 'Obat-obatan', emoji: '💊' },
  { key: 'Elektronik', emoji: '🔌' },
  { key: 'Lain-lain', emoji: '🎒' },
];

export const PACKING_PRESETS = {
  Pakaian: [
    'Baju kaos',
    'Celana panjang',
    'Celana pendek',
    'Pakaian dalam',
    'Kaos kaki',
    'Jaket',
    'Sendal',
    'Sepatu',
  ],
  Toiletries: [
    'Sikat gigi',
    'Pasta gigi',
    'Sabun',
    'Sampo',
    'Deodorant',
    'Sunscreen',
    'Handuk',
    'Tisu basah',
  ],
  Dokumen: ['KTP', 'KTM', 'Tiket', 'Uang cash', 'Kartu ATM', 'BPJS'],
  Elektronik: ['Charger HP', 'Powerbank', 'Earphone', 'Kabel data'],
  'Obat-obatan': ['Paracetamol', 'Antimo', 'Tolak angin', 'Minyak kayu putih'],
  'Lain-lain': ['Masker', 'Botol minum', 'Payung'],
};

const mk = (name, category, checked = false) => ({
  id: nanoid(),
  name,
  category,
  checked,
});

const seedTrips = () => [
  {
    id: nanoid(),
    name: 'Pulang Kampung Lebaran',
    destination: 'Lampung',
    date: addDays(new Date(), 7).toISOString(),
    items: [
      mk('Baju kaos', 'Pakaian', true),
      mk('Celana panjang', 'Pakaian', true),
      mk('Pakaian dalam', 'Pakaian', true),
      mk('Jaket', 'Pakaian', false),
      mk('Sikat gigi', 'Toiletries', true),
      mk('Pasta gigi', 'Toiletries', true),
      mk('Sabun', 'Toiletries', false),
      mk('KTP', 'Dokumen', true),
      mk('Tiket', 'Dokumen', true),
      mk('Uang cash', 'Dokumen', false),
      mk('Charger HP', 'Elektronik', true),
      mk('Powerbank', 'Elektronik', false),
      mk('Antimo', 'Obat-obatan', true),
      mk('Tolak angin', 'Obat-obatan', false),
      mk('Oleh-oleh', 'Lain-lain', false),
    ],
  },
];

export const usePackingStore = create(
  persist(
    (set) => ({
      trips: seedTrips(),
      actions: {
        addTrip: (trip) =>
          set((state) => ({
            trips: [
              { id: nanoid(), items: [], ...trip },
              ...state.trips,
            ],
          })),
        deleteTrip: (id) =>
          set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
        addItem: (tripId, item) =>
          set((state) => ({
            trips: state.trips.map((t) =>
              t.id === tripId
                ? { ...t, items: [...t.items, { id: nanoid(), checked: false, ...item }] }
                : t
            ),
          })),
        toggleItem: (tripId, itemId) =>
          set((state) => ({
            trips: state.trips.map((t) =>
              t.id === tripId
                ? {
                    ...t,
                    items: t.items.map((i) =>
                      i.id === itemId ? { ...i, checked: !i.checked } : i
                    ),
                  }
                : t
            ),
          })),
        deleteItem: (tripId, itemId) =>
          set((state) => ({
            trips: state.trips.map((t) =>
              t.id === tripId
                ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
                : t
            ),
          })),
      },
    }),
    {
      name: 'gue-ngekost-packing',
      version: 1,
      partialize: (state) => ({ trips: state.trips }),
    }
  )
);

export const usePackingActions = () => usePackingStore((s) => s.actions);
