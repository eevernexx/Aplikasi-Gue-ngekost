import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import BottomSheet from './BottomSheet';
import {
  FOOD_CATEGORIES,
  FOOD_SUGGESTIONS,
  useFoodActions,
} from '../../store/useFoodStore';
import { useT } from '../../i18n';

export default function AddFoodSheet({ open, onClose, defaultDate }) {
  const { addEntry } = useFoodActions();
  const { t, lng } = useT();
  const [name, setName] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [category, setCategory] = useState('warung');
  const [cost, setCost] = useState(0);
  const [calories, setCalories] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setTime(format(new Date(), 'HH:mm'));
      setCategory('warung');
      setCost(0);
      setCalories(0);
      setNote('');
      setError('');
    }
  }, [open]);

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('meal.nameReq'));
      return;
    }
    addEntry({
      name: name.trim(),
      time,
      date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
      category,
      cost: cost > 0 ? cost : null,
      calories: calories > 0 ? calories : null,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('meal.title')}>
      {/* Name + suggestions */}
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('meal.name')}</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('meal.namePh2')}
        className="mb-2 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm text-text-main outline-none focus:border-primary"
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FOOD_SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setName(s)}
            className="shrink-0 rounded-full border border-app-border bg-card px-3 py-1.5 text-xs text-text-sub active:scale-95"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Time */}
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('meal.time')}</label>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm text-text-main outline-none focus:border-primary"
      />

      {/* Category */}
      <label className="mb-2 block text-xs font-medium text-text-sub">{t('meal.category')}</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {FOOD_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
              category === c.key ? 'border-primary bg-accent' : 'border-app-border bg-card'
            }`}
          >
            <span className="text-lg">{c.emoji}</span>
            <span className="text-xs text-text-main">{lng('foodCategory', c.key)}</span>
          </button>
        ))}
      </div>

      {/* Cost + Calories */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-sub">{t('meal.cost')}</label>
          <input
            inputMode="numeric"
            value={cost ? cost.toLocaleString('id-ID') : ''}
            onChange={(e) =>
              setCost(parseInt(e.target.value.replace(/\D/g, '') || '0', 10))
            }
            placeholder={t('meal.costPh')}
            className="w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm text-text-main outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-sub">{t('meal.calories')}</label>
          <input
            inputMode="numeric"
            value={calories || ''}
            onChange={(e) =>
              setCalories(parseInt(e.target.value.replace(/\D/g, '') || '0', 10))
            }
            placeholder={t('meal.caloriesPh')}
            className="w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm text-text-main outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Note */}
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('meal.note')}</label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('meal.notePh')}
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm text-text-main outline-none focus:border-primary"
      />

      {error && <p className="mb-3 text-xs font-medium text-danger">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-soft-sm active:scale-[0.98] transition-transform"
      >
        {t('common.save')}
      </button>
    </BottomSheet>
  );
}
