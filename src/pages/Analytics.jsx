import { lazy, Suspense, useMemo, useState } from 'react';
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

const REC_STYLES = {
  danger: { tag: 'Penting', cls: 'border-danger/30 bg-danger/5', dot: 'bg-danger', tagCls: 'text-danger' },
  warning: { tag: 'Perhatian', cls: 'border-warning/30 bg-warning/5', dot: 'bg-warning', tagCls: 'text-warning' },
  info: { tag: 'Info', cls: 'border-primary-light/30 bg-accent/40', dot: 'bg-primary-light', tagCls: 'text-primary' },
};

function InsightsSection({ insights }) {
  const { appreciations, conclusions, recommendations } = insights;
  return (
    <div className="space-y-4">
      {appreciations.length > 0 && (
        <Section title="Apresiasi">
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
        <Section title="Kesimpulan">
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
        <Section title="Rekomendasi Kritis">
          <div className="space-y-2.5">
            {recommendations.map((r, i) => {
              const s = REC_STYLES[r.level] || REC_STYLES.info;
              return (
                <div key={i} className={`rounded-xl border p-3 ${s.cls}`}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${s.tagCls}`}>
                      {s.tag}
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
      console.error('Gagal membuat PDF:', err);
      alert('Maaf, gagal membuat PDF. Coba lagi ya.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadButton = hasData ? (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      aria-label="Download laporan PDF"
      className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-white shadow-soft-sm active:scale-95 transition-transform disabled:opacity-60"
    >
      {downloading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Download size={15} />
      )}
      {downloading ? 'Membuat…' : 'PDF'}
    </button>
  ) : null;

  return (
    <>
      <Header title="Analitik" subtitle={monthLabel} right={downloadButton} />

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

        {/* Insights: appreciation, conclusion, critical recommendations */}
        {hasData && (
          <>
            <div className="flex items-center gap-2 px-1 pt-2">
              <AlertTriangle size={16} className="text-primary" />
              <h2 className="text-sm font-bold text-text-main">Insight & Rekomendasi</h2>
            </div>
            <InsightsSection insights={insights} />
          </>
        )}
      </motion.div>
    </>
  );
}
