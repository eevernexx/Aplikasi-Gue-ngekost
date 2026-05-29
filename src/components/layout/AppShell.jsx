import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import BottomNav from './BottomNav';
import ErrorFallback from './ErrorFallback';

export default function AppShell() {
  const location = useLocation();
  const element = useOutlet();

  return (
    <div className="mx-auto min-h-[100dvh] w-full max-w-app bg-surface">
      <main className="pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Per-page error boundary; resets when the route changes. */}
            <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[location.pathname]}>
              {element}
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
