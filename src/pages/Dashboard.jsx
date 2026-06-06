import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  EyeOff,
  Pencil,
  TrendingDown,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import TransactionItem from '../components/ui/TransactionItem';
import AddTransactionSheet from '../components/ui/AddTransactionSheet';
import AddFoodSheet from '../components/ui/AddFoodSheet';
import SetBudgetSheet from '../components/ui/SetBudgetSheet';
import EmptyState from '../components/ui/EmptyState';
import { useFinanceStore } from '../store/useFinanceStore';
import { useFoodStore } from '../store/useFoodStore';
import { useUserStore } from '../store/useUserStore';
import { monthTotals, totalBalance } from '../lib/analytics';
import { formatDate, formatRupiah, formatTime } from '../lib/formatters';
import { useCountUp } from '../hooks/useCountUp';
import { useT } from '../i18n';
import { format } from 'date-fns';

// Greeting key per spec: 05:00-10:59 morning, 11:00-14:59 afternoon,
// 15:00-17:59 evening, 18:00-04:59 night
const greetingKey = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'greeting.morning';
  if (h >= 11 && h < 15) return 'greeting.afternoon';
  if (h >= 15 && h < 18) return 'greeting.evening';
  return 'greeting.night';
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
  const { t } = useT();
  const transactions = useFinanceStore((s) => s.transactions);
  const monthlyBudget = useFinanceStore((s) => s.monthlyBudget);
  const entries = useFoodStore((s) => s.entries);
  const fullName = useUserStore((s) => s.fullName);
  const hideBalance = useUserStore((s) => s.hideBalance);
  const toggleHideBalance = useUserStore((s) => s.toggleHideBalance);

  const MASK = 'Rp ••••••';

  const [txSheet, setTxSheet] = useState({ open: false, type: 'expense' });
  const [foodSheet, setFoodSheet] = useState(false);
  const [budgetSheet, setBudgetSheet] = useState(false);

  const balance = useMemo(() => totalBalance(transactions), [transactions]);
  const { income, expense } = useMemo(() => monthTotals(transactions), [transactions]);
  const animatedBalance = useCountUp(balance);

  const recent = useMemo(
    () =>
      [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
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

  const quickActions = [
    { labelKey: 'dash.qaIncome', onClick: () => setTxSheet({ open: true, type: 'income' }), icon: ArrowUpCircle },
    { labelKey: 'dash.qaExpense', onClick: () => setTxSheet({ open: true, type: 'expense' }), icon: ArrowDownCircle },
    { labelKey: 'dash.qaMeal', onClick: () => setFoodSheet(true), icon: Utensils },
  ];

  return (
    <>
      <Header title={fullName || 'Gue Ngekost'} subtitle={`${t(greetingKey())} 👋`} />

      {/* Single column on all sizes for the headline cards; only the two list
          sections split into two columns on desktop (see the grid wrapper below). */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 px-5 pt-1"
      >
        {/* Balance card */}
        <motion.div variants={item} className="glass-card-primary rounded-3xl p-5 text-white">
          <p className="text-xs font-medium text-white/70">{formatDate(new Date())}</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-white/80">{t('dash.balance')}</p>
            <button
              type="button"
              onClick={toggleHideBalance}
              aria-label={hideBalance ? t('dash.showBalance') : t('dash.hideBalance')}
              aria-pressed={hideBalance}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 active:scale-90"
            >
              {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-1 text-3xl font-bold tracking-tight">
            {hideBalance ? MASK : formatRupiah(animatedBalance)}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-primary-light">
              <TrendingUp size={14} /> {t('dash.in')} {hideBalance ? MASK : formatRupiah(income)}
            </span>
            <span className="flex items-center gap-1 text-red-300">
              <TrendingDown size={14} /> {t('dash.out')} {hideBalance ? MASK : formatRupiah(expense)}
            </span>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <StatCard title={t('dash.incomeMonth')} value={income} icon={ArrowUpCircle} color="light" />
          <StatCard title={t('dash.expenseMonth')} value={expense} icon={ArrowDownCircle} color="danger" />
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.labelKey}
              type="button"
              onClick={a.onClick}
              className="glass-card flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-medium text-text-main active:scale-95 transition-transform"
            >
              <a.icon size={20} className="text-primary" />
              {t(a.labelKey)}
            </button>
          ))}
        </motion.div>

        {/* Budget progress */}
        <motion.div variants={item} className="glass-card rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-text-main">{t('dash.budgetMonth')}</span>
            <button
              type="button"
              onClick={() => setBudgetSheet(true)}
              className="flex items-center gap-1 text-xs text-text-sub active:scale-95 transition-transform"
            >
              {formatRupiah(expense)} / {formatRupiah(monthlyBudget)}
              <Pencil size={12} className="text-primary-light" />
            </button>
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
            <p className="mt-2 text-xs font-medium text-danger">{t('dash.budgetWarn')}</p>
          )}
        </motion.div>

        {/* Lists: stacked on mobile, side by side on desktop */}
        <motion.div
          variants={item}
          className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-5"
        >
          {/* Recent transactions */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-text-main">{t('dash.recentTx')}</h2>
            </div>
            <div className="glass-card overflow-hidden rounded-2xl">
              {recent.length ? (
                recent.map((tx, i) => (
                  <div key={tx.id} className={i > 0 ? 'border-t border-app-border' : ''}>
                    <TransactionItem tx={tx} />
                  </div>
                ))
              ) : (
                <EmptyState title={t('dash.emptyTxTitle')} description={t('dash.emptyTxDesc')} />
              )}
            </div>
          </div>

          {/* Today's food */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-text-main">{t('dash.todayFood')}</h2>
              {todayCalories > 0 && (
                <span className="text-xs text-text-sub">{t('dash.kcalApprox', { n: todayCalories })}</span>
              )}
            </div>
            <div className="glass-card overflow-hidden rounded-2xl">
              {todayFood.length ? (
                todayFood.map((e, i) => (
                  <div
                    key={e.id}
                    className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-app-border' : ''}`}
                  >
                    <span className="text-base">🍽️</span>
                    <span className="flex-1 truncate text-sm text-text-main">{e.name}</span>
                    <span className="text-xs text-text-sub">{formatTime(e.time)}</span>
                  </div>
                ))
              ) : (
                <EmptyState
                  title={t('dash.emptyFoodTitle')}
                  description={t('dash.emptyFoodDesc')}
                  actionLabel={t('dash.logMeal')}
                  onAction={() => setFoodSheet(true)}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AddTransactionSheet
        open={txSheet.open}
        defaultType={txSheet.type}
        onClose={() => setTxSheet((s) => ({ ...s, open: false }))}
      />
      <AddFoodSheet open={foodSheet} onClose={() => setFoodSheet(false)} />
      <SetBudgetSheet open={budgetSheet} onClose={() => setBudgetSheet(false)} />
    </>
  );
}
