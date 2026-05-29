import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addMonths, isSameMonth, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import TransactionItem from '../components/ui/TransactionItem';
import SwipeToDelete from '../components/ui/SwipeToDelete';
import AddTransactionSheet from '../components/ui/AddTransactionSheet';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';
import { useFinanceStore, useFinanceActions } from '../store/useFinanceStore';
import { monthTotals } from '../lib/analytics';
import { formatRupiah, getDayLabel, getMonthYear } from '../lib/formatters';

export default function Cashflow() {
  const transactions = useFinanceStore((s) => s.transactions);
  const { deleteTransaction } = useFinanceActions();

  const [tab, setTab] = useState('expense'); // 'income' | 'expense'
  const [ref, setRef] = useState(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);

  const totals = useMemo(() => monthTotals(transactions, ref), [transactions, ref]);

  const grouped = useMemo(() => {
    const filtered = transactions
      .filter((t) => t.type === tab && isSameMonth(parseISO(t.date), ref))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const map = new Map();
    for (const t of filtered) {
      const key = t.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return [...map.entries()];
  }, [transactions, tab, ref]);

  return (
    <>
      <Header title="Cashflow" subtitle="Pemasukan & pengeluaran" />

      <div className="space-y-4 px-5 pt-1">
        {/* Month picker */}
        <div className="flex items-center justify-between rounded-2xl border border-app-border bg-card px-2 py-2 shadow-soft-sm">
          <button
            type="button"
            aria-label="Bulan sebelumnya"
            onClick={() => setRef((d) => addMonths(d, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
          >
            <ChevronLeft size={18} className="text-text-sub" />
          </button>
          <span className="text-sm font-semibold text-text-main">{getMonthYear(ref)}</span>
          <button
            type="button"
            aria-label="Bulan berikutnya"
            onClick={() => setRef((d) => addMonths(d, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
          >
            <ChevronRight size={18} className="text-text-sub" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-app-border bg-card p-3 text-center shadow-soft-sm">
          <div>
            <p className="text-[11px] text-text-sub">Masuk</p>
            <p className="mt-0.5 text-xs font-bold text-primary-light">
              {formatRupiah(totals.income)}
            </p>
          </div>
          <div className="border-x border-app-border">
            <p className="text-[11px] text-text-sub">Keluar</p>
            <p className="mt-0.5 text-xs font-bold text-danger">
              {formatRupiah(totals.expense)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-text-sub">Selisih</p>
            <p
              className={`mt-0.5 text-xs font-bold ${
                totals.net >= 0 ? 'text-primary' : 'text-danger'
              }`}
            >
              {formatRupiah(totals.net)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-card p-1 shadow-soft-sm">
          {[
            { key: 'expense', label: 'Pengeluaran' },
            { key: 'income', label: 'Pemasukan' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="relative flex-1 rounded-lg py-2 text-sm font-semibold"
            >
              {tab === t.key && (
                <motion.span
                  layoutId="cashflowTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-lg bg-accent"
                />
              )}
              <span
                className={`relative ${tab === t.key ? 'text-primary' : 'text-text-sub'}`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {grouped.length ? (
          <div className="space-y-4">
            {grouped.map(([day, items]) => (
              <div key={day}>
                <p className="mb-1.5 px-1 text-xs font-medium text-text-sub">
                  {getDayLabel(day)}
                </p>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map((tx) => (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      >
                        <SwipeToDelete onDelete={() => deleteTransaction(tx.id)}>
                          <div className="border border-app-border bg-card shadow-soft-sm">
                            <TransactionItem tx={tx} />
                          </div>
                        </SwipeToDelete>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-app-border bg-card shadow-soft-sm">
            <EmptyState
              title={`Belum ada ${tab === 'income' ? 'pemasukan' : 'pengeluaran'}`}
              description={`Belum ada catatan di ${getMonthYear(ref)}.`}
              actionLabel="Tambah Sekarang"
              onAction={() => setSheetOpen(true)}
            />
          </div>
        )}
      </div>

      <FAB onClick={() => setSheetOpen(true)} label="Tambah transaksi" />
      <AddTransactionSheet
        open={sheetOpen}
        defaultType={tab}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
