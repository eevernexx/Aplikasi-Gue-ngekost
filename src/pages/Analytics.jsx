import { lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Flame, TrendingDown, Utensils } from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { useFinanceStore } from '../store/useFinanceStore';
import { useFoodStore } from '../store/useFoodStore';
import {
  analyticsSummary,
  dailySpending,
  foodBreakdown,
  lastMonthsCashflow,
  spendingByCategory,
} from '../lib/analytics';
import { getMonthYear } from '../lib/formatters';

// Lazy-loaded chart components (requirement: React.lazy + Suspense).
const CashflowChart = lazy(() => import('../components/charts/CashflowChart'));
const SpendingDonut = lazy(() => import('../components/charts/SpendingDonut'));
const DailyBarChart = lazy(() => import('../components/charts/DailyBarChart'));

const ChartSkeleton = () => <div className="skeleton h-56 w-full rounded-xl" />;

const FOOD_COLORS = ['#1B4332', '#40916C', '#52B788', '#95D5B2'];

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-text-main">{title}</h2>
        {subtitle && <p className="text-xs text-text-sub">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const transactions = useFinanceStore((s) => s.transactions);
  const entries = useFoodStore((s) => s.entries);

  const cashflow = useMemo(() => lastMonthsCashflow(transactions, 6), [transactions]);
  const byCategory = useMemo(() => spendingByCategory(transactions), [transactions]);
  const daily = useMemo(() => dailySpending(transactions), [transactions]);
  const food = useMemo(() => foodBreakdown(entries), [entries]);
  const summary = useMemo(
    () => analyticsSummary(transactions, entries),
    [transactions, entries]
  );

  const monthLabel = getMonthYear(new Date());
  const hasExpense = byCategory.length > 0;

  return (
    <>
      <Header title="Analitik" subtitle={monthLabel} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 px-5 pt-1"
      >
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Rata-rata / hari"
            value={summary.avgPerDay}
            icon={TrendingDown}
            color="danger"
          />
          <StatCard
            title="Total makan"
            value={summary.mealsThisMonth}
            isCurrency={false}
            suffix=" menu"
            icon={Utensils}
            color="light"
          />
          <div className="rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Flame size={18} />
            </span>
            <p className="text-xs font-medium text-text-sub">Kategori terbesar</p>
            <p className="mt-0.5 truncate text-sm font-bold text-text-main">
              {summary.topCategory}
            </p>
          </div>
          <div className="rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <CalendarClock size={18} />
            </span>
            <p className="text-xs font-medium text-text-sub">Hari paling boros</p>
            <p className="mt-0.5 truncate text-sm font-bold text-text-main">
              {summary.worstDay}
            </p>
          </div>
        </div>

        {/* Monthly cashflow */}
        <Section title="Cashflow 6 Bulan" subtitle="Pemasukan vs pengeluaran">
          <Suspense fallback={<ChartSkeleton />}>
            <CashflowChart data={cashflow} />
          </Suspense>
        </Section>

        {/* Spending donut */}
        <Section title="Pengeluaran per Kategori" subtitle={monthLabel}>
          {hasExpense ? (
            <Suspense fallback={<ChartSkeleton />}>
              <SpendingDonut
                data={byCategory}
                centerLabel="Total"
                centerValue={summary.totalExpense}
              />
            </Suspense>
          ) : (
            <EmptyState title="Belum ada pengeluaran" description="Catat dulu pengeluaran bulan ini." />
          )}
        </Section>

        {/* Daily spending */}
        <Section title="Pengeluaran Harian" subtitle={monthLabel}>
          <Suspense fallback={<ChartSkeleton />}>
            <DailyBarChart data={daily} />
          </Suspense>
        </Section>

        {/* Food breakdown */}
        <Section title="Kebiasaan Makan" subtitle="Berdasarkan sumber makanan">
          {food.length ? (
            <Suspense fallback={<ChartSkeleton />}>
              <SpendingDonut
                data={food}
                variant="pie"
                colors={FOOD_COLORS}
                valueFormatter={(v) => `${v} menu`}
              />
            </Suspense>
          ) : (
            <EmptyState title="Belum ada data makan" description="Catat makan lo di tab Food." />
          )}
        </Section>
      </motion.div>
    </>
  );
}
