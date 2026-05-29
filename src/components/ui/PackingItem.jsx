import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export default function PackingItem({ item, onToggle, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <button
        type="button"
        onClick={onToggle}
        aria-label={item.checked ? 'Tandai belum' : 'Tandai sudah'}
        aria-pressed={item.checked}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          item.checked ? 'border-primary bg-primary' : 'border-app-border bg-card'
        }`}
      >
        {item.checked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            <Check size={14} className="text-white" strokeWidth={3} />
          </motion.span>
        )}
      </button>
      <span
        className={`flex-1 text-sm ${
          item.checked ? 'text-text-sub line-through' : 'text-text-main'
        }`}
      >
        {item.name}
      </span>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Hapus item"
        className="text-text-sub/60 transition-colors hover:text-danger active:scale-90"
      >
        <X size={16} />
      </button>
    </div>
  );
}
