import {
  AreaChart,
  Area,
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
      <p className="text-xs font-semibold text-text-main">{translate('an.dayTip', { label })}</p>
      <p className="text-xs text-primary-mid">{formatRupiah(payload[0].value)}</p>
    </div>
  );
}

export default function DailyBarChart({ data }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52B788" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#52B788" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2EF" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tickFormatter={(v) => formatRupiahShort(v)}
            tick={{ fontSize: 10, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            name={translate('cf.tabExpense')}
            stroke="#40916C"
            strokeWidth={2}
            fill="url(#dailyFill)"
            dot={{ r: 2.5, fill: '#40916C', strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            isAnimationActive
            animationBegin={200}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
