import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { subDays } from 'date-fns';

export const INCOME_CATEGORIES = [
  { name: 'Uang Bulanan', emoji: '💰' },
  { name: 'Beasiswa', emoji: '🎓' },
  { name: 'Freelance', emoji: '💼' },
  { name: 'Kiriman', emoji: '🎁' },
  { name: 'Lain-lain', emoji: '📦' },
];

export const EXPENSE_CATEGORIES = [
  { name: 'Makan', emoji: '🍜' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Keperluan Kuliah', emoji: '📚' },
  { name: 'Kost/Kontrakan', emoji: '🏠' },
  { name: 'Kesehatan', emoji: '💊' },
  { name: 'Belanja', emoji: '👕' },
  { name: 'Hiburan', emoji: '🎮' },
  { name: 'Pulsa/Internet', emoji: '📱' },
  { name: 'Lain-lain', emoji: '📦' },
];

const iso = (daysAgo, hour = 9, minute = 0) => {
  const d = subDays(new Date(), daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const seedTransactions = () => [
  // ---- income ----
  {
    id: nanoid(),
    type: 'income',
    amount: 1500000,
    category: 'Kiriman',
    categoryEmoji: '🎁',
    note: 'Kiriman bulanan orang tua',
    date: iso(28, 8, 30),
    createdAt: iso(28, 8, 30),
  },
  {
    id: nanoid(),
    type: 'income',
    amount: 500000,
    category: 'Beasiswa',
    categoryEmoji: '🎓',
    note: 'Cair beasiswa semester',
    date: iso(20, 10, 0),
    createdAt: iso(20, 10, 0),
  },
  {
    id: nanoid(),
    type: 'income',
    amount: 350000,
    category: 'Freelance',
    categoryEmoji: '💼',
    note: 'Bikin landing page',
    date: iso(9, 16, 0),
    createdAt: iso(9, 16, 0),
  },
  // ---- expenses ----
  {
    id: nanoid(),
    type: 'expense',
    amount: 800000,
    category: 'Kost/Kontrakan',
    categoryEmoji: '🏠',
    note: 'Bayar kost bulan ini',
    date: iso(27, 9, 0),
    createdAt: iso(27, 9, 0),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 50000,
    category: 'Pulsa/Internet',
    categoryEmoji: '📱',
    note: 'Paket data 30 hari',
    date: iso(25, 11, 0),
    createdAt: iso(25, 11, 0),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 75000,
    category: 'Keperluan Kuliah',
    categoryEmoji: '📚',
    note: 'Fotokopi + jilid',
    date: iso(22, 13, 0),
    createdAt: iso(22, 13, 0),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 30000,
    category: 'Transport',
    categoryEmoji: '🚗',
    note: 'Bensin motor',
    date: iso(18, 7, 30),
    createdAt: iso(18, 7, 30),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 25000,
    category: 'Makan',
    categoryEmoji: '🍜',
    note: 'Makan siang ayam geprek',
    date: iso(14, 12, 30),
    createdAt: iso(14, 12, 30),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 18000,
    category: 'Makan',
    categoryEmoji: '🍜',
    note: 'Nasi padang',
    date: iso(10, 19, 0),
    createdAt: iso(10, 19, 0),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 45000,
    category: 'Hiburan',
    categoryEmoji: '🎮',
    note: 'Top up game',
    date: iso(6, 21, 0),
    createdAt: iso(6, 21, 0),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 22000,
    category: 'Makan',
    categoryEmoji: '🍜',
    note: 'Kopi susu + roti',
    date: iso(3, 9, 30),
    createdAt: iso(3, 9, 30),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 35000,
    category: 'Belanja',
    categoryEmoji: '👕',
    note: 'Sabun, sampo, pasta gigi',
    date: iso(1, 17, 0),
    createdAt: iso(1, 17, 0),
  },
  {
    id: nanoid(),
    type: 'expense',
    amount: 28000,
    category: 'Makan',
    categoryEmoji: '🍜',
    note: 'Bakso komplit',
    date: iso(0, 12, 0),
    createdAt: iso(0, 12, 0),
  },
];

export const useFinanceStore = create(
  persist(
    (set) => ({
      transactions: seedTransactions(),
      monthlyBudget: 1500000,
      actions: {
        addTransaction: (tx) =>
          set((state) => ({
            transactions: [
              {
                id: nanoid(),
                createdAt: new Date().toISOString(),
                ...tx,
              },
              ...state.transactions,
            ],
          })),
        deleteTransaction: (id) =>
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          })),
        setMonthlyBudget: (amount) => set({ monthlyBudget: Number(amount) || 0 }),
      },
    }),
    {
      name: 'gue-ngekost-finance',
      version: 1,
      partialize: (state) => ({
        transactions: state.transactions,
        monthlyBudget: state.monthlyBudget,
      }),
    }
  )
);

// Stable selector for actions (avoids re-renders).
export const useFinanceActions = () => useFinanceStore((s) => s.actions);
