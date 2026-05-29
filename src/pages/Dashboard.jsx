import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingDown,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import TransactionItem from '../components/ui/TransactionItem';
import AddTransactionSheet from '../components/ui/AddTransactionSheet';
import AddFoodSheet from '../components/ui/AddFoodSheet';
import EmptyState from '../components/ui/EmptyState';
import { useFinanceStore } from '../store/useFinanceStore';
import { useFoodStore } from '../store/useFoodStore';
import { monthTotals, totalBalance } from '../lib/analytics';
import { capitalize, formatDate, formatRupiah, formatTime } from '../lib/formatters';
import { useCountUp } from '../hooks/useCountUp';
import { format } from 'date-fns';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function Dashboard() {
  const transactions = useFinanceStore((s) => s.transactions);
  const monthlyBudget = useFinanceStore((s) => s.monthlyBudget);
  const entries = useFoodStore((s) => s.entries);

  const [txSheet, setTxSheet] = useState({ open: false, type: 'expense' });
  const [foodSheet, setFoodSheet] = useState(false);

  const balance = useMemo(() => totalBalance(transactions), [transactions]);
  const { income, expense } = useMemo(() => monthTotals(transactions), [transactions]);
  const animatedBalance = useCountUp(balance);

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    [transactions]
  );

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayFood = useMemo(
    () => entries.filter((e) => e.date === todayKey).sort((a, b) => a.time.localeCompare(b.time)),
    [entries, todayKey]
  );
  const todayCalories = todayFood.reduce((s, e) => s + (e.calories || 0), 0);

  const budgetPct = monthlyBudget > 0 ? Math.min((expense / monthlyBudget) * 100, 100) : 0;
  const budgetColor =
    budgetPct >= 90 ? 'bg-danger' : budgetPct >= 70 ? 'bg-warning' : 'bg-primary-light';

  return (
    <>
      <Header title="Gue Ngekost" subtitle={`${greeting()} 👋`} />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 px-5 pt-1"
      >
        {/* Balance card */}
        <motion.div
          variants={item}
          className="rounded-3xl bg-primary p-5 text-white shadow-soft"
        >
          <p className="text-xs font-medium text-white/70">{formatDate(new Date())}</p>
          <p className="mt-3 text-sm text-white/80">Saldo Sekarang</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {formatRupiah(animatedBalance)}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-primary-light">
              <TrendingUp size={14} /> Masuk {formatRupiah(income)}
            </span>
            <span className="flex items-center gap-1 text-red-300">
              <TrendingDown size={14} /> Keluar {formatRupiah(expense)}
            </span>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <StatCard
            title="Pemasukan (bln ini)"
            value={income}
            icon={ArrowUpCircle}
            color="light"
          />
          <StatCard
            title="Pengeluaran (bln ini)"
            value={expense}
            icon={ArrowDownCircle}
            color="danger"
          />
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {[
            {
              label: '+ Pemasukan',
              onClick: () => setTxSheet({ open: true, type: 'income' }),
              icon: ArrowUpCircle,
            },
            {
              label: '+ Pengeluaran',
              onClick: () => setTxSheet({ open: true, type: 'expense' }),
              icon: ArrowDownCircle,
            },
            { label: '+ Makan', onClick: () => setFoodSheet(true), icon: Utensils },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={a.onClick}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-app-border bg-card py-3 text-xs font-medium text-text-main shadow-soft-sm active:scale-95 transition-transform"
            >
              <a.icon size={20} className="text-primary" />
              {a.label.replace('+ ', '')}
            </button>
          ))}
        </motion.div>

        {/* Budget progress */}
        <motion.div
          variants={item}
          className="rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm"
        >
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-text-main">Budget bulan ini</span>
            <span className="text-xs text-text-sub">
              {formatRupiah(expense)} / {formatRupiah(monthlyBudget)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface">
            <motion.div
              className={`h-full rounded-full ${budgetColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${budgetPct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          {budgetPct >= 90 && (
            <p className="mt-2 text-xs font-medium text-danger">
              Hati-hati, budget hampir habis!
            </p>
          )}
        </motion.div>

        {/* Recent transactions */}
        <motion.div variants={item}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-text-main">Transaksi Terakhir</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-app-border bg-card shadow-soft-sm">
            {recent.length ? (
              recent.map((tx, i) => (
                <div
                  key={tx.id}
                  className={i > 0 ? 'border-t border-app-border' : ''}
                >
                  <TransactionItem tx={tx} />
                </div>
              ))
            ) : (
              <EmptyState title="Belum ada transaksi" description="Catat pemasukan atau pengeluaran pertama lo." />
            )}
          </div>
        </motion.div>

        {/* Today's food */}
        <motion.div variants={item}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-text-main">Makan Hari Ini</h2>
            {todayCalories > 0 && (
              <span className="text-xs text-text-sub">~{todayCalories} kkal</span>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-app-border bg-card shadow-soft-sm">
            {todayFood.length ? (
              todayFood.map((e, i) => (
                <div
                  key={e.id}
                  className={`flex items-center gap-3 px-4 py-2.5 ${
                    i > 0 ? 'border-t border-app-border' : ''
                  }`}
                >
                  <span className="text-base">🍽️</span>
                  <span className="flex-1 truncate text-sm text-text-main">{e.name}</span>
                  <span className="text-xs text-text-sub">{formatTime(e.time)}</span>
                </div>
              ))
            ) : (
              <EmptyState
                title="Belum makan apa-apa"
                description="Jangan lupa makan, catat di sini ya."
                actionLabel="Catat Makan"
                onAction={() => setFoodSheet(true)}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      <AddTransactionSheet
        open={txSheet.open}
        defaultType={txSheet.type}
        onClose={() => setTxSheet((s) => ({ ...s, open: false }))}
      />
      <AddFoodSheet open={foodSheet} onClose={() => setFoodSheet(false)} />
    </>
  );
}
