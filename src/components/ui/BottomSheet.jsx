import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Keyboard-aware bottom sheet.
 *
 * - Locks body scroll while open.
 * - 100dvh-based sizing so it never exceeds the *visible* viewport.
 * - Tracks the on-screen keyboard via `visualViewport` and lifts the sheet so
 *   inputs and the submit button stay reachable (Android/iOS, Chrome, Safari,
 *   installed PWA). Content scrolls within the remaining space.
 * - Honors the bottom safe-area inset when no keyboard is shown.
 */
export default function BottomSheet({ open, onClose, title, children }) {
  const [kbInset, setKbInset] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined' || !window.visualViewport) return undefined;
    const vv = window.visualViewport;
    const update = () => {
      const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKbInset(overlap);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      setKbInset(0);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Sheet'}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
            style={{ bottom: kbInset, maxHeight: `calc(100dvh - ${kbInset}px - 16px)` }}
            className="fixed inset-x-0 z-50 mx-auto flex w-full max-w-app flex-col overflow-hidden rounded-t-3xl bg-card shadow-soft"
          >
            <div className="flex shrink-0 cursor-grab justify-center pt-3 active:cursor-grabbing">
              <div className="h-1.5 w-12 rounded-full bg-app-border" />
            </div>
            {title && (
              <div className="shrink-0 px-5 pb-2 pt-3">
                <h2 className="text-lg font-semibold text-text-main">{title}</h2>
              </div>
            )}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 pt-1 no-scrollbar"
              style={{ paddingBottom: kbInset ? 24 : 'max(2rem, env(safe-area-inset-bottom))' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
