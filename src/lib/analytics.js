import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isWithinInterval,
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

/** Supported report periods and how many calendar months each spans. */
export const PERIOD_MONTHS = { month: 1, '6months': 6, year: 12 };

/**
 * Resolves a report period into an inclusive {start, end} interval ending at
 * the month that contains `ref`. `month` -> current month, `6months`/`year`
 * -> the trailing 6/12 months (oldest day -> last day of current month).
 */
export function periodRange(period = 'month', ref = new Date()) {
  const months = PERIOD_MONTHS[period] || 1;
  return {
    start: startOfMonth(subMonths(ref, months - 1)),
    end: endOfMonth(ref),
    months,
  };
}

/** Income/expense totals within an inclusive date interval. */
export function rangeTotals(transactions, start, end) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (isWithinInterval(d(t.date), { start, end })) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
  }
  return { income, expense, net: income - expense };
}

/** Income/expense totals for a given month (default: now). */
export function monthTotals(transactions, ref = new Date()) {
  return rangeTotals(transactions, startOfMonth(ref), endOfMonth(ref));
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

/** Expense breakdown by category within an interval, sorted desc. */
export function spendingByCategoryRange(transactions, start, end) {
  const map = new Map();
  for (const t of transactions) {
    if (t.type === 'expense' && isWithinInterval(d(t.date), { start, end })) {
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

/** Expense breakdown by category for a month (default now), sorted desc. */
export function spendingByCategory(transactions, ref = new Date()) {
  return spendingByCategoryRange(transactions, startOfMonth(ref), endOfMonth(ref));
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

/** Food entry counts by category within an interval -> chart data. */
export function foodBreakdownRange(entries, start, end) {
  const labels = Object.fromEntries(FOOD_CATEGORIES.map((c) => [c.key, c.label]));
  const map = new Map();
  for (const e of entries) {
    const dt = parseISO(`${e.date}T00:00:00`);
    if (isWithinInterval(dt, { start, end })) {
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

/** Food entry counts by category for a month -> chart data. */
export function foodBreakdown(entries, ref = new Date()) {
  return foodBreakdownRange(entries, startOfMonth(ref), endOfMonth(ref));
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

/**
 * Headline numbers over an arbitrary interval, used by multi-month reports.
 * `avgPerDay` divides total expense by the days actually elapsed (the trailing
 * month may be partial), and `worstDay` is the single calendar day with the
 * highest spend across the whole interval.
 */
export function rangeSummary(transactions, entries, start, end, ref = new Date()) {
  const expenses = transactions.filter(
    (t) => t.type === 'expense' && isWithinInterval(d(t.date), { start, end })
  );
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);

  const lastDay = ref < end ? ref : end;
  const daysElapsed = Math.max(1, differenceInCalendarDays(lastDay, start) + 1);
  const avgPerDay = totalExpense / daysElapsed;

  const byCat = spendingByCategoryRange(transactions, start, end);
  const topCategory = byCat[0]?.name || '-';

  const byDay = new Map();
  for (const t of expenses) {
    const key = format(d(t.date), 'yyyy-MM-dd');
    byDay.set(key, (byDay.get(key) || 0) + t.amount);
  }
  let worstKey = null;
  let worstAmount = 0;
  for (const [key, amount] of byDay) {
    if (amount > worstAmount) {
      worstAmount = amount;
      worstKey = key;
    }
  }
  const worstDay = worstKey
    ? format(parseISO(worstKey), 'd MMM yyyy', { locale: dfLocale() })
    : '-';

  const meals = entries.filter((e) =>
    isWithinInterval(parseISO(`${e.date}T00:00:00`), { start, end })
  ).length;

  return {
    totalExpense,
    avgPerDay,
    topCategory,
    worstDay,
    worstDayAmount: worstAmount,
    meals,
    daysElapsed,
  };
}

/** Income breakdown by category within an interval, sorted desc. */
export function incomeByCategoryRange(transactions, start, end) {
  const map = new Map();
  for (const t of transactions) {
    if (t.type === 'income' && isWithinInterval(d(t.date), { start, end })) {
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

/** Day-by-day income/expense/net for an interval — only days with activity. */
export function dailyBreakdownRange(transactions, start, end) {
  const byDay = new Map();
  for (const t of transactions) {
    if (isWithinInterval(d(t.date), { start, end })) {
      const key = format(d(t.date), 'yyyy-MM-dd');
      const prev = byDay.get(key) || { income: 0, expense: 0 };
      if (t.type === 'income') prev.income += t.amount;
      else prev.expense += t.amount;
      byDay.set(key, prev);
    }
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expense }]) => ({
      label: format(parseISO(key), 'd MMM yyyy', { locale: dfLocale() }),
      income,
      expense,
      net: income - expense,
    }));
}

/** All transactions within an interval sorted by date desc. */
export function transactionsInRange(transactions, start, end) {
  return transactions
    .filter((t) => isWithinInterval(d(t.date), { start, end }))
    .sort((a, b) => d(b.date) - d(a.date));
}

/** Food entries within an interval sorted by date+time asc. */
export function foodEntriesInRange(entries, start, end) {
  return entries
    .filter((e) => isWithinInterval(parseISO(`${e.date}T00:00:00`), { start, end }))
    .sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      return cmp !== 0 ? cmp : (a.time || '').localeCompare(b.time || '');
    });
}

/** Per-month income/expense/net rows covering the interval (oldest -> newest). */
export function monthlyBreakdown(transactions, start, end) {
  const out = [];
  for (let cursor = startOfMonth(start); cursor <= end; cursor = addMonths(cursor, 1)) {
    const { income, expense, net } = monthTotals(transactions, cursor);
    out.push({
      label: format(cursor, 'MMM yyyy', { locale: dfLocale() }),
      income,
      expense,
      net,
    });
  }
  return out;
}
