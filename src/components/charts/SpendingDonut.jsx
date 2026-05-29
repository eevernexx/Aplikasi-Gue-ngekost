import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatRupiah, formatRupiahShort } from '../../lib/formatters';

const DEFAULT_COLORS = [
  '#1B4332',
  '#40916C',
  '#52B788',
  '#74C69D',
  '#95D5B2',
  '#B7E4C7',
  '#D8F3DC',
  '#2D6A4F',
  '#081C15',
];

function CustomTooltip({ active, payload, valueFormatter }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-app-border bg-card px-3 py-2 shadow-soft">
      <p className="text-xs font-semibold text-text-main">{p.name}</p>
      <p className="text-xs text-text-sub">{valueFormatter(p.value)}</p>
    </div>
  );
}

export default function SpendingDonut({
  data, // [{ name, value }]
  centerLabel,
  centerValue,
  colors = DEFAULT_COLORS,
  variant = 'donut', // 'donut' | 'pie'
  valueFormatter = formatRupiah,
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const inner = variant === 'pie' ? 0 : 58;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={inner}
              outerRadius={84}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
              animationBegin={200}
              animationDuration={1000}
            >
              {data.map((entry, i) => (
                <Cell key={entry.name} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          </PieChart>
        </ResponsiveContainer>
        {variant === 'donut' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] text-text-sub">{centerLabel}</span>
            <span className="text-base font-bold text-text-main">
              {centerValue != null ? valueFormatter(centerValue) : ''}
            </span>
          </div>
        )}
      </div>

      <ul className="w-full space-y-1.5">
        {data.map((entry, i) => {
          const pct = Math.round((entry.value / total) * 100);
          return (
            <li key={entry.name} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="flex-1 truncate text-text-main">{entry.name}</span>
              <span className="text-text-sub">{formatRupiahShort(entry.value)}</span>
              <span className="w-9 text-right font-semibold text-text-main">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
