import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import PackingItem from '../components/ui/PackingItem';
import BottomSheet from '../components/ui/BottomSheet';
import EmptyState from '../components/ui/EmptyState';
import {
  PACKING_CATEGORIES,
  PACKING_PRESETS,
  usePackingStore,
  usePackingActions,
} from '../store/usePackingStore';
import { formatDate } from '../lib/formatters';

function CircularProgress({ value }) {
  const size = 96;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#40916C"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-text-main">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

function CategorySection({ trip, category, emoji, onAdd, onToggle, onDelete }) {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState('');
  const items = trip.items.filter((i) => i.category === category);

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(category, draft.trim());
    setDraft('');
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-app-border bg-card shadow-soft-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-text-main">
          <span className="text-base">{emoji}</span> {category}
          <span className="text-xs font-normal text-text-sub">
            ({items.filter((i) => i.checked).length}/{items.length})
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={18} className="text-text-sub" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-app-border px-4 pb-3 pt-1">
              {items.map((item) => (
                <PackingItem
                  key={item.id}
                  item={item}
                  onToggle={() => onToggle(item.id)}
                  onDelete={() => onDelete(item.id)}
                />
              ))}
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder={`Tambah ${category.toLowerCase()}...`}
                  className="flex-1 rounded-lg border border-app-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={submit}
                  aria-label="Tambah item"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PackingTripDetail() {
  const { tripId } = useParams();
  const trip = usePackingStore((s) => s.trips.find((t) => t.id === tripId));
  const { addItem, toggleItem, deleteItem } = usePackingActions();
  const [presetsOpen, setPresetsOpen] = useState(false);

  const progress = useMemo(() => {
    if (!trip || trip.items.length === 0) return 0;
    return (trip.items.filter((i) => i.checked).length / trip.items.length) * 100;
  }, [trip]);

  if (!trip) {
    return (
      <>
        <Header title="Trip tidak ditemukan" showBack />
        <div className="px-5">
          <EmptyState title="Trip tidak ada" description="Trip ini mungkin sudah dihapus." />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={trip.name} subtitle={trip.destination} showBack />

      <div className="space-y-4 px-5 pt-1">
        {/* Progress card */}
        <div className="flex items-center gap-4 rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm">
          <CircularProgress value={progress} />
          <div className="min-w-0">
            <p className="text-xs text-text-sub">Berangkat</p>
            <p className="text-sm font-semibold text-text-main">{formatDate(trip.date)}</p>
            <p className="mt-1 text-xs text-text-sub">
              {trip.items.filter((i) => i.checked).length} dari {trip.items.length} barang siap
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPresetsOpen(true)}
          className="w-full rounded-xl border border-dashed border-primary-mid bg-accent/40 py-2.5 text-sm font-semibold text-primary active:scale-[0.99] transition-transform"
        >
          + Tambah dari daftar cepat
        </button>

        {/* Category sections */}
        {PACKING_CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.key}
            trip={trip}
            category={cat.key}
            emoji={cat.emoji}
            onAdd={(category, name) => addItem(trip.id, { name, category })}
            onToggle={(itemId) => toggleItem(trip.id, itemId)}
            onDelete={(itemId) => deleteItem(trip.id, itemId)}
          />
        ))}
      </div>

      {/* Presets sheet */}
      <BottomSheet open={presetsOpen} onClose={() => setPresetsOpen(false)} title="Daftar Cepat">
        <div className="space-y-5">
          {PACKING_CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <p className="mb-2 text-xs font-semibold text-text-sub">
                {cat.emoji} {cat.key}
              </p>
              <div className="flex flex-wrap gap-2">
                {(PACKING_PRESETS[cat.key] || []).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addItem(trip.id, { name: preset, category: cat.key })}
                    className="rounded-full border border-app-border bg-card px-3 py-1.5 text-xs text-text-main active:scale-95 active:border-primary active:bg-accent"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
