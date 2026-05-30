import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import BottomSheet from './BottomSheet';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  useFinanceActions,
} from '../../store/useFinanceStore';
import { useT } from '../../i18n';

const todayKey = () => format(new Date(), 'yyyy-MM-dd');

export default function AddTransactionSheet({ open, onClose, defaultType = 'expense' }) {
  const { addTransaction } = useFinanceActions();
  const { t, lng } = useT();
  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayKey());
  const [error, setError] = useState('');

  // Reset whenever opened.
  useEffect(() => {
    if (open) {
      setType(defaultType);
      setAmount(0);
      setCategory(null);
      setNote('');
      setDate(todayKey());
      setError('');
    }
  }, [open, defaultType]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAmount = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setAmount(digits ? parseInt(digits, 10) : 0);
  };

  const handleSave = () => {
    if (!amount || amount <= 0) {
      setError(t('tx.invalidAmount'));
      return;
    }
    if (!category) {
      setError(t('tx.pickCategory'));
      return;
    }
    addTransaction({
      type,
      amount,
      category: category.name,
      categoryEmoji: category.emoji,
      note: note.trim(),
      date: new Date(`${date}T${format(new Date(), 'HH:mm:ss')}`).toISOString(),
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('tx.title')}>
      {/* Type toggle */}
      <div className="mb-4 flex rounded-xl bg-surface p-1">
        {[
          { key: 'income', label: t('tx.income') },
          { key: 'expense', label: t('tx.expense') },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setType(tab.key);
              setCategory(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              type === tab.key ? 'bg-card text-primary shadow-soft-sm' : 'text-text-sub'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nominal */}
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('tx.amount')}</label>
      <div className="mb-4 flex items-center rounded-xl border border-app-border bg-surface px-3">
        <span className="mr-1 text-sm font-semibold text-text-sub">Rp</span>
        <input
          inputMode="numeric"
          value={amount ? amount.toLocaleString('id-ID') : ''}
          onChange={handleAmount}
          placeholder="0"
          className="w-full bg-transparent py-3 text-lg font-bold text-text-main outline-none"
        />
      </div>

      {/* Category grid */}
      <label className="mb-2 block text-xs font-medium text-text-sub">{t('tx.category')}</label>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {categories.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setCategory(c)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors ${
              category?.name === c.name
                ? 'border-primary bg-accent'
                : 'border-app-border bg-card'
            }`}
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="text-[11px] leading-tight text-text-main">{lng('txCategory', c.name)}</span>
          </button>
        ))}
      </div>

      {/* Note */}
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('tx.note')}</label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('tx.notePh')}
        className="mb-4 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-sm text-text-main outline-none focus:border-primary"
      />

      {/* Date */}
      <label className="mb-1 block text-xs font-medium text-text-sub">{t('tx.date')}</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
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
