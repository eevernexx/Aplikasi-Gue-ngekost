import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Onboarding from './components/Onboarding';
import Dashboard from './pages/Dashboard';
import Cashflow from './pages/Cashflow';
import FoodTracker from './pages/FoodTracker';
import PackingList from './pages/PackingList';
import PackingTripDetail from './pages/PackingTripDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { useUserStore } from './store/useUserStore';

export default function App() {
  const onboarded = useUserStore((s) => s.onboarded);

  // First run: capture the user's name before showing the app.
  if (!onboarded) return <Onboarding />;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="cashflow" element={<Cashflow />} />
        <Route path="food" element={<FoodTracker />} />
        <Route path="packing" element={<PackingList />} />
        <Route path="packing/:tripId" element={<PackingTripDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
