import { useEffect, useState } from 'react';
import BottomSheet from './BottomSheet';
import { useFinanceStore, useFinanceActions } from '../../store/useFinanceStore';
import { formatRupiah } from '../../lib/formatters';
import { useT } from '../../i18n';

const PRESETS = [1000000, 1500000, 2000000, 2500000, 3000000];

export default function SetBudgetSheet({ open, onClose }) {
  const monthlyBudget = useFinanceStore((s) => s.monthlyBudget);
  const { setMonthlyBudget } = useFinanceActions();
  const { t } = useT();
  const [amount, setAmount] = useState(monthlyBudget);

  // Sync the input with the stored value each time the sheet opens.
  useEffect(() => {
    if (open) setAmount(monthlyBudget);
  }, [open, monthlyBudget]);

  const handleSave = () => {
    setMonthlyBudget(amount);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t('budget.title')}>
      <p className="mb-4 text-xs text-text-sub">{t('budget.hint')}</p>

      <label className="mb-1 block text-xs font-medium text-text-sub">
        {t('budget.perMonth')}
      </label>
      <input
        inputMode="numeric"
        autoFocus
        value={amount ? amount.toLocaleString('id-ID') : ''}
        onChange={(e) =>
          setAmount(parseInt(e.target.value.replace(/\D/g, '') || '0', 10))
        }
        placeholder={t('budget.ph')}
        className="mb-3 w-full rounded-xl border border-app-border bg-surface px-3 py-3 text-base font-semibold text-text-main outline-none focus:border-primary"
      />

      {/* Quick presets */}
      <div className="mb-5 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(p)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              amount === p
                ? 'border-primary bg-accent text-primary'
                : 'border-app-border bg-card text-text-sub'
            }`}
          >
            {formatRupiah(p)}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-soft-sm active:scale-[0.98] transition-transform"
      >
        {t('budget.save')}
      </button>
    </BottomSheet>
  );
}
