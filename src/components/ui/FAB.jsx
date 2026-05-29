import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function FAB({ onClick, icon, label = 'Tambah' }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{
        scale: { duration: 1.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' },
      }}
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-soft ring-4 ring-primary/15"
    >
      {icon || <Plus size={26} strokeWidth={2.4} />}
    </motion.button>
  );
}
