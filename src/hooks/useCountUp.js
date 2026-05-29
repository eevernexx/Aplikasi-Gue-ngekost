import { useEffect, useRef, useState } from 'react';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Smoothly animates a number from 0 (or previous value) to targetValue.
 * Uses requestAnimationFrame with an easeOutCubic curve.
 *
 * @param {number} targetValue
 * @param {number} duration ms (default 1200)
 * @returns {number} the current animated value
 */
export function useCountUp(targetValue, duration = 1200) {
  const safeTarget = Number.isFinite(targetValue) ? targetValue : 0;
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const delta = safeTarget - from;

    // No movement needed.
    if (delta === 0) {
      setValue(safeTarget);
      return undefined;
    }

    startRef.current = null;

    const tick = (now) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = from + delta * eased;
      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = safeTarget;
        setValue(safeTarget);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // remember last rendered value as the next starting point
      fromRef.current = value;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTarget, duration]);

  return value;
}
