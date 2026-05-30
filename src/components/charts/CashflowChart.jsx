import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatRupiah, formatRupiahShort } from '../../lib/formatters';
import { translate } from '../../i18n';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-app-border bg-card px-3 py-2 shadow-soft">
      <p className="mb-1 text-xs font-semibold text-text-main">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs" style={{ color: p.color }}>
          {p.name}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function CashflowChart({ data }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2EF" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatRupiahShort(v)}
            tick={{ fontSize: 10, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(82,183,136,0.08)' }} />
          <Bar
            dataKey="income"
            name={translate('cf.tabIncome')}
            fill="#52B788"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationBegin={200}
            animationDuration={1000}
          />
          <Bar
            dataKey="expense"
            name={translate('cf.tabExpense')}
            fill="#DC2626"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationBegin={350}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
