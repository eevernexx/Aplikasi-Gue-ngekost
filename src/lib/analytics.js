import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { dfLocale, getLang, label, translate } from '../i18n';
import { FOOD_CATEGORIES } from '../store/useFoodStore';

const d = (s) => (typeof s === 'string' ? parseISO(s) : s);

/** Lifetime balance = all income - all expense. */
export function totalBalance(transactions) {
  return transactions.reduce(
    (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
    0
  );
}

/** Income/expense totals for a given month (default: now). */
export function monthTotals(transactions, ref = new Date()) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (isSameMonth(d(t.date), ref)) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
  }
  return { income, expense, net: income - expense };
}

/** Grouped cashflow for the last `n` months (oldest -> newest). */
export function lastMonthsCashflow(transactions, n = 6) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const ref = subMonths(new Date(), i);
    const { income, expense } = monthTotals(transactions, ref);
    out.push({
      month: format(ref, 'MMM', { locale: dfLocale() }),
      income,
      expense,
    });
  }
  return out;
}

/** Expense breakdown by category for a month (default now), sorted desc. */
export function spendingByCategory(transactions, ref = new Date()) {
  const map = new Map();
  for (const t of transactions) {
    if (t.type === 'expense' && isSameMonth(d(t.date), ref)) {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    }
  }
  const en = getLang() === 'en';
  return [...map.entries()]
    .map(([name, value]) => ({
      name: en ? label('txCategory', name) : name,
      raw: name,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

/** Per-day expense series for the current month. */
export function dailySpending(transactions, ref = new Date()) {
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);
  const days = eachDayOfInterval({ start, end });
  const byDay = new Map();
  for (const t of transactions) {
    const dt = d(t.date);
    if (t.type === 'expense' && isSameMonth(dt, ref)) {
      const key = format(dt, 'd');
      byDay.set(key, (byDay.get(key) || 0) + t.amount);
    }
  }
  return days.map((day) => {
    const key = format(day, 'd');
    return { day: key, amount: byDay.get(key) || 0 };
  });
}

/** Food entry counts by category for a month -> chart data. */
export function foodBreakdown(entries, ref = new Date()) {
  const labels = Object.fromEntries(FOOD_CATEGORIES.map((c) => [c.key, c.label]));
  const map = new Map();
  for (const e of entries) {
    const dt = parseISO(`${e.date}T00:00:00`);
    if (isSameMonth(dt, ref)) {
      map.set(e.category, (map.get(e.category) || 0) + 1);
    }
  }
  const en = getLang() === 'en';
  return [...map.entries()]
    .map(([key, value]) => ({
      name: en ? label('foodCategory', key) : labels[key] || key,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

/** Headline numbers for the Analytics summary cards (current month). */
export function analyticsSummary(transactions, entries, ref = new Date()) {
  const expenses = transactions.filter(
    (t) => t.type === 'expense' && isSameMonth(d(t.date), ref)
  );
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

  const today = ref.getDate();
  const avgPerDay = today > 0 ? totalExpense / today : 0;

  const byCat = spendingByCategory(transactions, ref);
  const topCategory = byCat[0]?.name || '-';

  const daily = dailySpending(transactions, ref);
  const worstDay = daily.reduce(
    (max, cur) => (cur.amount > max.amount ? cur : max),
    { day: '-', amount: 0 }
  );

  const mealsThisMonth = entries.filter((e) =>
    isSameMonth(parseISO(`${e.date}T00:00:00`), ref)
  ).length;

  return {
    avgPerDay,
    topCategory,
    mealsThisMonth,
    worstDay: worstDay.amount > 0 ? translate('an.dayTip', { label: worstDay.day }) : '-',
    worstDayAmount: worstDay.amount,
    totalExpense,
  };
}
