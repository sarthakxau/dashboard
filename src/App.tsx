import { Routes, Route } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import Overview from '@/pages/Overview';
import Users from '@/pages/Users';
import Transactions from '@/pages/Transactions';
import Portfolio from '@/pages/Portfolio';
import Gifts from '@/pages/Gifts';

function Placeholder({ title }: { title: string }) {
  return <div className="p-8 text-secondary">{title} — coming soon</div>;
}

export default function App() {
  return (
    <PageShell>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/gifts" element={<Gifts />} />
        <Route path="/health" element={<Placeholder title="Health" />} />
      </Routes>
    </PageShell>
  );
}
