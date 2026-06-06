import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Badge from '../components/ui/Badge';
import BottomSheet from '../components/ui/BottomSheet';
import FAB from '../components/ui/FAB';
import EmptyState from '../components/ui/EmptyState';
import SwipeToDelete from '../components/ui/SwipeToDelete';
import { usePackingStore, usePackingActions } from '../store/usePackingStore';
import { formatDate } from '../lib/formatters';
import { useT } from '../i18n';

function tripStatus(items) {
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  if (total === 0 || done === 0)
    return { key: 'pack.statusNotStarted', variant: 'neutral', done, total };
  if (done === total) return { key: 'pack.statusReady', variant: 'success', done, total };
  return { key: 'pack.statusPacking', variant: 'warning', done, total };
}

function CreateTripSheet({ open, onClose }) {
  const { addTrip } = usePackingActions();
  const { t } = useT();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('pack.tripNameReq'));
      return;
    }
    addTrip({
      name: name.trim(),
      destination: destination.trim(),
      date: new Date(`${date}T08:00:00`).toISOString(),
      items: [],
    });
    setName('');
    setDestination('');
    setError('');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('pack.newTrip')}>
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('pack.tripName')}</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('pack.tripNamePh')}
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary"
      />
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('pack.destination')}</label>
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder={t('pack.destinationPh')}
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary"
      />
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('pack.departDate')}</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="mb-3 text-xs font-medium text-danger">{error}</p>}
      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-soft-sm active:scale-[0.98] transition-transform"
      >
        {t('pack.createTrip')}
      </button>
    </BottomSheet>
  );
}

export default function PackingList() {
  const trips = usePackingStore((s) => s.trips);
  const { deleteTrip } = usePackingActions();
  const navigate = useNavigate();
  const { t } = useT();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Header title={t('pack.title')} subtitle={t('pack.subtitle')} />

      {/* Single column on phones; 2-up trip cards on desktop. */}
      <div className="grid gap-3 px-5 pt-1 lg:grid-cols-2 lg:items-start">
        {trips.length ? (
          <AnimatePresence initial={false}>
            {trips.map((trip) => {
              const status = tripStatus(trip.items);
              const pct = status.total ? (status.done / status.total) * 100 : 0;
              return (
                <motion.div
                  key={trip.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                >
                  <SwipeToDelete onDelete={() => deleteTrip(trip.id)} ariaLabel={t('pack.deleteTrip')}>
                    <button
                      type="button"
                      onClick={() => navigate(`/packing/${trip.id}`)}
                      className="glass-card w-full rounded-2xl p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-text-main">{trip.name}</h3>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-sub">
                            <MapPin size={12} /> {trip.destination || t('pack.noDestination')} ·{' '}
                            {formatDate(trip.date)}
                          </p>
                        </div>
                        <ChevronRight size={18} className="mt-0.5 shrink-0 text-text-sub" />
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                          <motion.div
                            className="h-full rounded-full bg-primary-light"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="shrink-0 text-xs text-text-sub">
                          {status.done}/{status.total}
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <Badge variant={status.variant}>{t(status.key)}</Badge>
                      </div>
                    </button>
                  </SwipeToDelete>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="glass-card rounded-2xl lg:col-span-2">
            <EmptyState
              title={t('pack.emptyTitle')}
              description={t('pack.emptyDesc')}
              actionLabel={t('pack.newTrip')}
              onAction={() => setSheetOpen(true)}
            />
          </div>
        )}
      </div>

      <FAB onClick={() => setSheetOpen(true)} label={t('pack.newTrip')} />
      <CreateTripSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
