import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

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

export const useFinanceStore = create(
  persist(
    (set) => ({
      transactions: [],
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
      version: 2,
      // Bumped to v2 to wipe the old seed/demo data so the app starts clean.
      migrate: () => ({ transactions: [], monthlyBudget: 1500000 }),
      partialize: (state) => ({
        transactions: state.transactions,
        monthlyBudget: state.monthlyBudget,
      }),
    }
  )
);

// Stable selector for actions (avoids re-renders).
export const useFinanceActions = () => useFinanceStore((s) => s.actions);
