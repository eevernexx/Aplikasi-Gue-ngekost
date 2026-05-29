import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Trash2 } from 'lucide-react';

/**
 * Wrap any row. Drag left past the threshold (or tap the revealed trash) to delete.
 * The actual exit slide-out animation is handled by the parent <AnimatePresence>
 * via the `motion` element you place around the list items.
 */
export default function SwipeToDelete({ children, onDelete, ariaLabel = 'Hapus' }) {
  const x = useMotionValue(0);
  const [revealed, setRevealed] = useState(false);
  const trashOpacity = useTransform(x, [-80, -20, 0], [1, 0.4, 0]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.button
        type="button"
        aria-label={ariaLabel}
        onClick={onDelete}
        style={{ opacity: trashOpacity }}
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-danger text-white"
      >
        <Trash2 size={20} />
      </motion.button>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -88, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          if (info.offset.x < -120 || info.velocity.x < -600) {
            onDelete();
          } else if (info.offset.x < -50) {
            x.set(-80);
            setRevealed(true);
          } else {
            x.set(0);
            setRevealed(false);
          }
        }}
        onClick={() => {
          if (revealed) {
            x.set(0);
            setRevealed(false);
          }
        }}
        className="relative z-10 bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
}
