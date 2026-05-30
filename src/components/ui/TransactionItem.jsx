import { formatRupiah, formatTime } from '../../lib/formatters';

export default function TransactionItem({ tx }) {
  const isIncome = tx.type === 'income';
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">
        {tx.categoryEmoji || '📦'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-text-main">{tx.category}</p>
        <p className="break-words text-xs text-text-sub">
          {tx.note ? tx.note : 'Tanpa keterangan'} · {formatTime(tx.date)}
        </p>
      </div>
      <p
        className={`shrink-0 text-sm font-bold ${
          isIncome ? 'text-primary-light' : 'text-danger'
        }`}
      >
        {isIncome ? '+' : '-'}
        {formatRupiah(tx.amount)}
      </p>
    </div>
  );
}
