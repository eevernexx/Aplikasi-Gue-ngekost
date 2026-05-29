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

function tripStatus(items) {
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  if (total === 0 || done === 0)
    return { label: 'Belum Mulai', variant: 'neutral', done, total };
  if (done === total) return { label: 'Siap Berangkat', variant: 'success', done, total };
  return { label: 'Sedang Packing', variant: 'warning', done, total };
}

function CreateTripSheet({ open, onClose }) {
  const { addTrip } = usePackingActions();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Nama trip wajib diisi');
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
    <BottomSheet open={open} onClose={onClose} title="Buat Trip Baru">
      <label className="mb-1 block text-xs font-medium text-text-sub">Nama Trip</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="mis. Pulang Kampung Lebaran"
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary"
      />
      <label className="mb-1 block text-xs font-medium text-text-sub">Tujuan</label>
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="mis. Lampung"
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary"
      />
      <label className="mb-1 block text-xs font-medium text-text-sub">Tanggal Berangkat</label>
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
        Buat Trip
      </button>
    </BottomSheet>
  );
}

export default function PackingList() {
  const trips = usePackingStore((s) => s.trips);
  const { deleteTrip } = usePackingActions();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Header title="Packing List" subtitle="Checklist barang trip lo" />

      <div className="space-y-3 px-5 pt-1">
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
                  <SwipeToDelete onDelete={() => deleteTrip(trip.id)} ariaLabel="Hapus trip">
                    <button
                      type="button"
                      onClick={() => navigate(`/packing/${trip.id}`)}
                      className="w-full rounded-2xl border border-app-border bg-card p-4 text-left shadow-soft-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-text-main">
                            {trip.name}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-sub">
                            <MapPin size={12} /> {trip.destination || 'Tanpa tujuan'} ·{' '}
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
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                    </button>
                  </SwipeToDelete>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="rounded-2xl border border-app-border bg-card shadow-soft-sm">
            <EmptyState
              title="Belum ada trip"
              description="Bikin checklist biar gak ada barang ketinggalan."
              actionLabel="Buat Trip Baru"
              onAction={() => setSheetOpen(true)}
            />
          </div>
        )}
      </div>

      <FAB onClick={() => setSheetOpen(true)} label="Buat trip baru" />
      <CreateTripSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
