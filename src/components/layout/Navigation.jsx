import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, Utensils, Luggage, PieChart, Wallet } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard },
  { to: '/cashflow', label: 'Cashflow', icon: ArrowLeftRight },
  { to: '/food', label: 'Makan', icon: Utensils },
  { to: '/packing', label: 'Packing', icon: Luggage },
  { to: '/analytics', label: 'Analitik', icon: PieChart },
];

const isActive = (pathname, to) =>
  to === '/'
    ? pathname === '/'
    : pathname === to || pathname.startsWith(to + '/');

/**
 * Adaptive navigation:
 *  - phones (default): fixed bottom tab bar, aligned to the app column.
 *  - tablets/desktop (md+): in-flow vertical sidebar rail.
 * Both layouts render together but only one is visible per breakpoint,
 * so each uses a distinct layoutId to avoid framer-motion conflicts.
 */
export default function Navigation() {
  const { pathname } = useLocation();

  return (
    <>
      {/* Sidebar rail — tablets & up */}
      <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-app-border bg-card/60 px-3 py-6 backdrop-blur-md md:flex">
        <div className="flex items-center gap-2 px-3 pb-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <Wallet size={18} />
          </span>
          <span className="truncate text-base font-bold text-text-main">Gue Ngekost</span>
        </div>
        <ul className="flex flex-col gap-1">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  aria-label={label}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  {active && (
                    <motion.span
                      layoutId="activeRail"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-xl bg-accent"
                    />
                  )}
                  <Icon
                    size={20}
                    className={`relative ${active ? 'text-primary' : 'text-text-sub'}`}
                    strokeWidth={active ? 2.4 : 2}
                  />
                  <span className={`relative ${active ? 'text-primary' : 'text-text-sub'}`}>
                    {label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Bottom tab bar — phones only */}
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-app border-t border-app-border bg-card/95 backdrop-blur-md safe-bottom md:hidden">
        <ul className="flex items-stretch justify-around px-1">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  aria-label={label}
                  className="relative flex flex-col items-center gap-0.5 px-1 pb-1.5 pt-2.5"
                >
                  {active && (
                    <motion.span
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                    />
                  )}
                  <motion.span whileTap={{ scale: 0.9 }}>
                    <Icon
                      size={22}
                      className={active ? 'text-primary' : 'text-text-sub'}
                      strokeWidth={active ? 2.4 : 2}
                    />
                  </motion.span>
                  <span
                    className={`text-[10px] font-medium ${
                      active ? 'text-primary' : 'text-text-sub'
                    }`}
                  >
                    {label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
