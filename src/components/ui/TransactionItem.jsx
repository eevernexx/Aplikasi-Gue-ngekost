import { formatRupiah, formatTime } from '../../lib/formatters';

export default function TransactionItem({ tx }) {
  const isIncome = tx.type === 'income';
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">
        {tx.categoryEmoji || '📦'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-main">{tx.category}</p>
        <p className="truncate text-xs text-text-sub">
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
