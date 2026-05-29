import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Cashflow from './pages/Cashflow';
import FoodTracker from './pages/FoodTracker';
import PackingList from './pages/PackingList';
import PackingTripDetail from './pages/PackingTripDetail';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="cashflow" element={<Cashflow />} />
        <Route path="food" element={<FoodTracker />} />
        <Route path="packing" element={<PackingList />} />
        <Route path="packing/:tripId" element={<PackingTripDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
