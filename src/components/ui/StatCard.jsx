import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { formatRupiah } from '../../lib/formatters';

export default function StatCard({
  title,
  value = 0,
  isCurrency = true,
  prefix = '',
  suffix = '',
  trend, // number (percentage) | undefined
  trendLabel,
  icon: Icon,
  color = 'primary', // 'primary' | 'danger' | 'light'
  loading = false,
}) {
  const animated = useCountUp(loading ? 0 : value);

  const colorMap = {
    primary: 'text-primary bg-accent',
    danger: 'text-danger bg-danger/10',
    light: 'text-primary-light bg-primary-light/10',
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="skeleton mb-3 h-8 w-8 rounded-lg" />
        <div className="skeleton mb-2 h-3 w-20" />
        <div className="skeleton h-6 w-28" />
      </div>
    );
  }

  const display = isCurrency
    ? formatRupiah(animated)
    : `${prefix}${Math.round(animated).toLocaleString('id-ID')}${suffix}`;

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}>
            <Icon size={18} />
          </span>
        )}
        {typeof trend === 'number' && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              trend >= 0 ? 'text-primary-light' : 'text-danger'
            }`}
          >
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-text-sub">{title}</p>
      <p className="mt-0.5 text-lg font-bold text-text-main">{display}</p>
      {trendLabel && <p className="mt-1 text-[11px] text-text-sub">{trendLabel}</p>}
    </div>
  );
}
