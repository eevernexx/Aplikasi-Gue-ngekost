import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import FoodItem from '../components/ui/FoodItem';
import SwipeToDelete from '../components/ui/SwipeToDelete';
import AddFoodSheet from '../components/ui/AddFoodSheet';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';
import { useFoodStore, useFoodActions } from '../store/useFoodStore';
import { useLocalDate } from '../hooks/useLocalDate';
import { getDayLabel, getMealTime, formatRupiah } from '../lib/formatters';

const SECTIONS = [
  { key: 'pagi', label: 'Pagi', emoji: '🌅' },
  { key: 'siang', label: 'Siang', emoji: '☀️' },
  { key: 'sore', label: 'Sore', emoji: '🌆' },
  { key: 'malam', label: 'Malam', emoji: '🌙' },
];

export default function FoodTracker() {
  const entries = useFoodStore((s) => s.entries);
  const { deleteEntry } = useFoodActions();
  const date = useLocalDate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const dayEntries = useMemo(
    () =>
      entries
        .filter((e) => e.date === date.dateKey)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [entries, date.dateKey]
  );

  const summary = useMemo(() => {
    const kcal = dayEntries.reduce((s, e) => s + (e.calories || 0), 0);
    const cost = dayEntries.reduce((s, e) => s + (e.cost || 0), 0);
    return { count: dayEntries.length, kcal, cost };
  }, [dayEntries]);

  const grouped = useMemo(() => {
    const map = { pagi: [], siang: [], sore: [], malam: [] };
    for (const e of dayEntries) map[getMealTime(e.time)].push(e);
    return map;
  }, [dayEntries]);

  return (
    <>
      <Header title="Food Tracker" subtitle="Catat makan harian" />

      <div className="space-y-4 px-5 pt-1">
        {/* Date nav */}
        <div className="flex items-center justify-between rounded-2xl border border-app-border bg-card px-2 py-2 shadow-soft-sm">
          <button
            type="button"
            aria-label="Hari sebelumnya"
            onClick={date.prev}
            className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
          >
            <ChevronLeft size={18} className="text-text-sub" />
          </button>
          <span className="text-sm font-semibold text-text-main">
            {getDayLabel(date.current)}
          </span>
          <button
            type="button"
            aria-label="Hari berikutnya"
            onClick={date.next}
            disabled={date.isToday}
            className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90 disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-text-sub" />
          </button>
        </div>

        {/* Daily summary */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-primary p-3 text-center text-white shadow-soft">
          <div>
            <p className="text-lg font-bold">{summary.count}</p>
            <p className="text-[11px] text-white/70">menu</p>
          </div>
          <div className="border-x border-white/15">
            <p className="text-lg font-bold">{summary.kcal || '—'}</p>
            <p className="text-[11px] text-white/70">kkal</p>
          </div>
          <div>
            <p className="text-lg font-bold">{summary.cost ? formatRupiah(summary.cost) : '—'}</p>
            <p className="text-[11px] text-white/70">total</p>
          </div>
        </div>

        {/* Timeline */}
        {summary.count ? (
          <div className="space-y-4">
            {SECTIONS.map((sec) => {
              const items = grouped[sec.key];
              if (!items.length) return null;
              return (
                <div key={sec.key}>
                  <p className="mb-1.5 px-1 text-xs font-semibold text-text-sub">
                    {sec.emoji} {sec.label}
                  </p>
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {items.map((e) => (
                        <motion.div
                          key={e.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        >
                          <SwipeToDelete onDelete={() => deleteEntry(e.id)}>
                            <div className="border border-app-border bg-card shadow-soft-sm">
                              <FoodItem entry={e} />
                            </div>
                          </SwipeToDelete>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-app-border bg-card shadow-soft-sm">
            <EmptyState
              title="Belum ada catatan makan"
              description="Catat apa yang lo makan hari ini."
              actionLabel="Catat Makan"
              onAction={() => setSheetOpen(true)}
            />
          </div>
        )}
      </div>

      <FAB onClick={() => setSheetOpen(true)} label="Catat makan" />
      <AddFoodSheet
        open={sheetOpen}
        defaultDate={date.dateKey}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
