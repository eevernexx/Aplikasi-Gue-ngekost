import { Suspense, useMemo, useState } from 'react';
import { lazyWithRetry } from '../lib/lazyWithRetry';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Download,
  Flame,
  Loader2,
  Sparkles,
  TrendingDown,
  Utensils,
} from 'lucide-react';
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
import { financialInsights } from '../lib/insights';
import { exportAnalyticsPdf } from '../lib/exportPdf';
import { getMonthYear } from '../lib/formatters';
import { useT } from '../i18n';

// Lazy-loaded chart components (requirement: React.lazy + Suspense).
const CashflowChart = lazyWithRetry(() => import('../components/charts/CashflowChart'), 'cashflow');
const SpendingDonut = lazyWithRetry(() => import('../components/charts/SpendingDonut'), 'donut');
const DailyBarChart = lazyWithRetry(() => import('../components/charts/DailyBarChart'), 'daily');

const ChartSkeleton = () => <div className="skeleton h-56 w-full rounded-xl" />;

const FOOD_COLORS = ['#1B4332', '#40916C', '#52B788', '#95D5B2'];

function Section({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm ${className}`}>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-text-main">{title}</h2>
        {subtitle && <p className="text-xs text-text-sub">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const REC_STYLES = {
  danger: { tagKey: 'an.tagImportant', cls: 'border-danger/30 bg-danger/5', dot: 'bg-danger', tagCls: 'text-danger' },
  warning: { tagKey: 'an.tagAttention', cls: 'border-warning/30 bg-warning/5', dot: 'bg-warning', tagCls: 'text-warning' },
  info: { tagKey: 'an.tagInfo', cls: 'border-primary-light/30 bg-accent/40', dot: 'bg-primary-light', tagCls: 'text-primary' },
};

function InsightsSection({ insights }) {
  const { t } = useT();
  const { appreciations, conclusions, recommendations } = insights;
  return (
    // Stacked on phones; 3 columns on desktop so text lines stay readable.
    <div className="space-y-4 lg:grid lg:grid-cols-3 lg:items-start lg:gap-4 lg:space-y-0">
      {appreciations.length > 0 && (
        <Section title={t('an.appreciation')}>
          <div className="space-y-2.5">
            {appreciations.map((t, i) => (
              <div key={i} className="flex gap-2.5">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-primary-light" />
                <p className="text-sm leading-relaxed text-text-main">{t}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {conclusions.length > 0 && (
        <Section title={t('an.conclusion')}>
          <div className="space-y-2.5">
            {conclusions.map((t, i) => (
              <div key={i} className="flex gap-2.5">
                <ClipboardList size={16} className="mt-0.5 shrink-0 text-text-sub" />
                <p className="text-sm leading-relaxed text-text-main">{t}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {recommendations.length > 0 && (
        <Section title={t('an.recommendation')}>
          <div className="space-y-2.5">
            {recommendations.map((r, i) => {
              const s = REC_STYLES[r.level] || REC_STYLES.info;
              return (
                <div key={i} className={`rounded-xl border p-3 ${s.cls}`}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${s.tagCls}`}>
                      {t(s.tagKey)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-text-main">{r.text}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

export default function Analytics() {
  const { t } = useT();
  const transactions = useFinanceStore((s) => s.transactions);
  const monthlyBudget = useFinanceStore((s) => s.monthlyBudget);
  const entries = useFoodStore((s) => s.entries);

  const [downloading, setDownloading] = useState(false);

  const cashflow = useMemo(() => lastMonthsCashflow(transactions, 6), [transactions]);
  const byCategory = useMemo(() => spendingByCategory(transactions), [transactions]);
  const daily = useMemo(() => dailySpending(transactions), [transactions]);
  const food = useMemo(() => foodBreakdown(entries), [entries]);
  const summary = useMemo(
    () => analyticsSummary(transactions, entries),
    [transactions, entries]
  );
  const insights = useMemo(
    () => financialInsights(transactions, entries, monthlyBudget),
    [transactions, entries, monthlyBudget]
  );

  const monthLabel = getMonthYear(new Date());
  const hasExpense = byCategory.length > 0;
  const hasData = transactions.length > 0 || entries.length > 0;

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await exportAnalyticsPdf({ transactions, entries, monthlyBudget });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert(t('an.pdfError'));
    } finally {
      setDownloading(false);
    }
  };

  const downloadButton = hasData ? (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      aria-label={t('an.pdfAria')}
      className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white shadow-soft-sm active:scale-95 transition-transform disabled:opacity-60"
    >
      {downloading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Download size={15} />
      )}
      {downloading ? t('an.generating') : t('an.pdf')}
    </button>
  ) : null;

  return (
    <>
      <Header title={t('an.title')} subtitle={monthLabel} right={downloadButton} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 px-5 pt-1"
      >
        {/* Summary cards: 2-up on phones, 4-up on desktop */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title={t('an.avgPerDay')}
            value={summary.avgPerDay}
            icon={TrendingDown}
            color="danger"
          />
          <StatCard
            title={t('an.totalMeals')}
            value={summary.mealsThisMonth}
            isCurrency={false}
            suffix={t('an.menuSuffix')}
            icon={Utensils}
            color="light"
          />
          <div className="rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
              <Flame size={18} />
            </span>
            <p className="text-xs font-medium text-text-sub">{t('an.topCategory')}</p>
            <p className="mt-0.5 truncate text-sm font-bold text-text-main">
              {summary.topCategory}
            </p>
          </div>
          <div className="rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <CalendarClock size={18} />
            </span>
            <p className="text-xs font-medium text-text-sub">{t('an.worstDay')}</p>
            <p className="mt-0.5 truncate text-sm font-bold text-text-main">
              {summary.worstDay}
            </p>
          </div>
        </div>

        {/* Charts: single column on phones, 2-up on desktop. The 6-month
            cashflow timeline spans the full width since it benefits from it. */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Monthly cashflow */}
          <Section title={t('an.cashflow6')} subtitle={t('an.cashflow6Sub')} className="lg:col-span-2">
            <Suspense fallback={<ChartSkeleton />}>
              <CashflowChart data={cashflow} />
            </Suspense>
          </Section>

          {/* Spending donut */}
          <Section title={t('an.byCategory')} subtitle={monthLabel}>
            {hasExpense ? (
              <Suspense fallback={<ChartSkeleton />}>
                <SpendingDonut
                  data={byCategory}
                  centerLabel={t('an.total')}
                  centerValue={summary.totalExpense}
                />
              </Suspense>
            ) : (
              <EmptyState title={t('an.emptyExpenseTitle')} description={t('an.emptyExpenseDesc')} />
            )}
          </Section>

          {/* Daily spending */}
          <Section title={t('an.daily')} subtitle={monthLabel}>
            <Suspense fallback={<ChartSkeleton />}>
              <DailyBarChart data={daily} />
            </Suspense>
          </Section>

          {/* Food breakdown */}
          <Section title={t('an.foodHabit')} subtitle={t('an.foodHabitSub')} className="lg:col-span-2">
            {food.length ? (
              <Suspense fallback={<ChartSkeleton />}>
                <SpendingDonut
                  data={food}
                  variant="pie"
                  colors={FOOD_COLORS}
                  valueFormatter={(v) => t('an.menuUnit', { n: v })}
                />
              </Suspense>
            ) : (
              <EmptyState title={t('an.emptyFoodTitle')} description={t('an.emptyFoodDesc')} />
            )}
          </Section>
        </div>

        {/* Insights: appreciation, conclusion, critical recommendations */}
        {hasData && (
          <>
            <div className="flex items-center gap-2 px-1 pt-2">
              <AlertTriangle size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-text-main">{t('an.insights')}</h2>
            </div>
            <InsightsSection insights={insights} />
          </>
        )}
      </motion.div>
    </>
  );
}
