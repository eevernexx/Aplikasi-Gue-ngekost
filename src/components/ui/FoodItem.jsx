import { formatRupiah, formatTime } from '../../lib/formatters';
import { FOOD_CATEGORIES } from '../../store/useFoodStore';

const catMap = Object.fromEntries(FOOD_CATEGORIES.map((c) => [c.key, c]));

export default function FoodItem({ entry }) {
  const cat = catMap[entry.category] || { emoji: '🍽️', label: entry.category };
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-lg">
        {cat.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-text-main">{entry.name}</p>
          <span className="shrink-0 text-xs text-text-sub">{formatTime(entry.time)}</span>
        </div>
        <p className="mt-0.5 text-xs text-text-sub">{cat.label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {typeof entry.cost === 'number' && entry.cost > 0 && (
            <span className="font-medium text-danger">{formatRupiah(entry.cost)}</span>
          )}
          {typeof entry.calories === 'number' && entry.calories > 0 && (
            <span className="text-primary-mid">~{entry.calories} kkal</span>
          )}
        </div>
        {entry.note && <p className="mt-1 text-xs italic text-text-sub">“{entry.note}”</p>}
      </div>
    </div>
  );
}
