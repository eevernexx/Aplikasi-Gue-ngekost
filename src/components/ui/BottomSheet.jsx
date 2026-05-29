import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomSheet({ open, onClose, title, children }) {
  // Lock body scroll while open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
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
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] w-full max-w-app overflow-hidden rounded-t-3xl bg-card shadow-soft"
          >
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-12 rounded-full bg-app-border" />
            </div>
            {title && (
              <div className="px-5 pb-2 pt-3">
                <h2 className="text-lg font-semibold text-text-main">{title}</h2>
              </div>
            )}
            <div className="max-h-[78vh] overflow-y-auto px-5 pb-8 pt-1 safe-bottom no-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
