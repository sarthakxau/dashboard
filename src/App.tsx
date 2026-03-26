import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';

const Overview = lazy(() => import('@/pages/Overview'));
const Users = lazy(() => import('@/pages/Users'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Gifts = lazy(() => import('@/pages/Gifts'));
const Health = lazy(() => import('@/pages/Health'));

export default function App() {
  return (
    <PageShell>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/users" element={<Users />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/gifts" element={<Gifts />} />
          <Route path="/health" element={<Health />} />
        </Routes>
      </Suspense>
    </PageShell>
  );
}
