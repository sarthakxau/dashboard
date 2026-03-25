import { Routes, Route } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import Overview from '@/pages/Overview';
import Users from '@/pages/Users';
import Transactions from '@/pages/Transactions';

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
        <Route path="/portfolio" element={<Placeholder title="Portfolio" />} />
        <Route path="/gifts" element={<Placeholder title="Gifts" />} />
        <Route path="/health" element={<Placeholder title="Health" />} />
      </Routes>
    </PageShell>
  );
}
