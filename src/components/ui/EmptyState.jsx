import { motion } from 'framer-motion';

export default function EmptyState({ title, description, actionLabel, onAction, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-accent">
        {icon || (
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="8" y="14" width="32" height="24" rx="4" fill="#52B788" opacity="0.35" />
            <rect x="8" y="14" width="32" height="8" rx="4" fill="#40916C" opacity="0.6" />
            <circle cx="32" cy="26" r="3" fill="#1B4332" />
            <path
              d="M14 10h20l4 4H10l4-4Z"
              fill="#1B4332"
              opacity="0.5"
            />
          </svg>
        )}
      </div>
      <h3 className="mb-1 text-base font-semibold text-text-main">{title}</h3>
      {description && (
        <p className="mb-4 max-w-xs text-sm text-text-sub">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft-sm active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
