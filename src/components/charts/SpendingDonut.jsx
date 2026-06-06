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

const RADIAN = Math.PI / 180;

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

// Percent label drawn just outside each slice, with a short slice-coloured
// tick connecting it to its arc. Names/nominal stay in the legend below; the
// on-chart percent (kept short) reads cleanly and never clips on narrow phones.
function makeSliceLabel(colors) {
  return function SliceLabel({ cx, cy, midAngle, outerRadius, percent, index }) {
    const pct = Math.round(percent * 100);
    if (pct < 1) return null; // skip slivers — they'd round to 0% / overlap
    const color = colors[index % colors.length];
    const cos = Math.cos(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    const tx1 = cx + (outerRadius + 2) * cos;
    const ty1 = cy + (outerRadius + 2) * sin;
    const tx2 = cx + (outerRadius + 8) * cos;
    const ty2 = cy + (outerRadius + 8) * sin;
    const lx = cx + (outerRadius + 12) * cos;
    const ly = cy + (outerRadius + 12) * sin;
    const anchor = Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end';
    return (
      <g style={{ pointerEvents: 'none' }}>
        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        <text
          x={lx}
          y={ly}
          textAnchor={anchor}
          dominantBaseline="central"
          style={{ fill: 'rgb(var(--color-text-main))' }}
          fontSize={11}
          fontWeight={600}
        >
          {pct}%
        </text>
      </g>
    );
  };
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
  const renderLabel = makeSliceLabel(colors);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Taller than the bare donut so the percent labels sitting just outside
          the top/bottom slices have room to breathe instead of being clipped. */}
      <div className="relative h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={inner}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
              label={renderLabel}
              labelLine={false}
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
