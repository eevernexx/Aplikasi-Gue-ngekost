import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import Navigation from './Navigation';
import ErrorFallback from './ErrorFallback';

export default function AppShell() {
  const location = useLocation();
  const element = useOutlet();

  return (
    // Phone: single centered column (max-w-app). Tablet+: widens and pairs a
    // sidebar rail with a comfortable, centered content column.
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-app bg-surface md:max-w-5xl">
      <Navigation />
      {/* pb clears the fixed bottom bar on phones; the rail removes the need on md+. */}
      <main className="min-w-0 flex-1 pb-28 md:pb-10">
        <div className="mx-auto w-full md:max-w-2xl">
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
        </div>
      </main>
    </div>
  );
}
