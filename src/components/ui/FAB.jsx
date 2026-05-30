import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function FAB({ onClick, icon, label = 'Tambah' }) {
  return (
    // Track the centered app column (mirrors AppShell) so the button stays in
    // the bottom-right corner of the content instead of the raw viewport edge.
    // Sits above the bottom tab bar on phones; lifts to the corner on tablets.
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 md:bottom-8">
      <div className="mx-auto flex max-w-app justify-end px-5 md:max-w-5xl">
        <motion.button
          type="button"
          onClick={onClick}
          aria-label={label}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            scale: { duration: 1.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' },
          }}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-soft ring-4 ring-primary/15"
        >
          {icon || <Plus size={26} strokeWidth={2.4} />}
        </motion.button>
      </div>
    </div>
  );
}
