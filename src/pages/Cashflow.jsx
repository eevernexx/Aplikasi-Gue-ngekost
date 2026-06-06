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
import { useT } from '../i18n';

export default function Cashflow() {
  const transactions = useFinanceStore((s) => s.transactions);
  const { deleteTransaction } = useFinanceActions();
  const { t } = useT();

  const [tab, setTab] = useState('expense');
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
      <Header title="Cashflow" subtitle={t('cf.subtitle')} />

      <div className="space-y-4 px-5 pt-1">
        {/* Month picker */}
        <div className="glass-card flex items-center justify-between rounded-2xl px-2 py-2">
          <button
            type="button"
            aria-label={t('cf.prevMonth')}
            onClick={() => setRef((d) => addMonths(d, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
          >
            <ChevronLeft size={18} className="text-text-sub" />
          </button>
          <span className="text-sm font-semibold text-text-main">{getMonthYear(ref)}</span>
          <button
            type="button"
            aria-label={t('cf.nextMonth')}
            onClick={() => setRef((d) => addMonths(d, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
          >
            <ChevronRight size={18} className="text-text-sub" />
          </button>
        </div>

        {/* Summary */}
        <div className="glass-card grid grid-cols-3 gap-2 rounded-2xl p-3 text-center">
          <div>
            <p className="text-[11px] text-text-sub">{t('cf.in')}</p>
            <p className="mt-0.5 text-xs font-bold text-primary-light">{formatRupiah(totals.income)}</p>
          </div>
          <div className="border-x border-app-border">
            <p className="text-[11px] text-text-sub">{t('cf.out')}</p>
            <p className="mt-0.5 text-xs font-bold text-danger">{formatRupiah(totals.expense)}</p>
          </div>
          <div>
            <p className="text-[11px] text-text-sub">{t('cf.net')}</p>
            <p className={`mt-0.5 text-xs font-bold ${totals.net >= 0 ? 'text-primary' : 'text-danger'}`}>
              {formatRupiah(totals.net)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card flex rounded-xl p-1">
          {[
            { key: 'expense', label: t('cf.tabExpense') },
            { key: 'income', label: t('cf.tabIncome') },
          ].map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className="relative flex-1 rounded-lg py-2 text-sm font-semibold"
            >
              {tab === tb.key && (
                <motion.span
                  layoutId="cashflowTab"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-lg bg-accent"
                />
              )}
              <span className={`relative ${tab === tb.key ? 'text-primary' : 'text-text-sub'}`}>
                {tb.label}
              </span>
            </button>
          ))}
        </div>

        {/* Grouped list */}
        {grouped.length ? (
          <div className="space-y-4">
            {grouped.map(([day, items]) => (
              <div key={day}>
                <p className="mb-1.5 px-1 text-xs font-medium text-text-sub">{getDayLabel(day)}</p>
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
          <div className="glass-card rounded-2xl">
            <EmptyState
              title={tab === 'income' ? t('cf.emptyIncome') : t('cf.emptyExpense')}
              description={t('cf.emptyDesc', { month: getMonthYear(ref) })}
              actionLabel={t('cf.addNow')}
              onAction={() => setSheetOpen(true)}
            />
          </div>
        )}
      </div>

      <FAB onClick={() => setSheetOpen(true)} label={t('cf.addTx')} />
      <AddTransactionSheet open={sheetOpen} defaultType={tab} onClose={() => setSheetOpen(false)} />
    </>
  );
}
