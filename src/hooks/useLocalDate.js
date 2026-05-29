import { useCallback, useMemo, useState } from 'react';
import { addDays, format, isToday } from 'date-fns';

/**
 * Day-by-day navigation helper.
 * Returns the current date (Date), its "YYYY-MM-DD" key, and prev/next/reset controls.
 *
 * @param {Date} [initial]
 */
export function useLocalDate(initial) {
  const [current, setCurrent] = useState(() => initial || new Date());

  const prev = useCallback(() => setCurrent((d) => addDays(d, -1)), []);
  const next = useCallback(() => setCurrent((d) => addDays(d, 1)), []);
  const reset = useCallback(() => setCurrent(new Date()), []);
  const set = useCallback((d) => setCurrent(d), []);

  const dateKey = useMemo(() => format(current, 'yyyy-MM-dd'), [current]);
  const isCurrentToday = useMemo(() => isToday(current), [current]);

  return { current, dateKey, isToday: isCurrentToday, prev, next, reset, set };
}
