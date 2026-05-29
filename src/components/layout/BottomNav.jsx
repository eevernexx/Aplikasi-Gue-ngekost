import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, Utensils, Luggage, PieChart } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard },
  { to: '/cashflow', label: 'Cashflow', icon: ArrowLeftRight },
  { to: '/food', label: 'Makan', icon: Utensils },
  { to: '/packing', label: 'Packing', icon: Luggage },
  { to: '/analytics', label: 'Analitik', icon: PieChart },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (to) =>
    to === '/'
      ? location.pathname === '/'
      : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-app border-t border-app-border bg-card/95 backdrop-blur-md safe-bottom">
      <ul className="flex items-stretch justify-around px-1">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
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
  );
}
