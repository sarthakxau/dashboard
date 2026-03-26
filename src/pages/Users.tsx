import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TopBar from '@/components/layout/TopBar';
import MetricCard from '@/components/cards/MetricCard';
import ChartCard from '@/components/charts/ChartCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { fetchUserMetrics, fetchRecentSignups, fetchUserSegments, fetchSignupTimeSeries, fetchDailySignups } from '@/lib/queries/users';
import { formatDate } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/constants';
import { AXIS_TICK, TOOLTIP_STYLE } from '@/lib/chartTheme';
import type { DbUser } from '@/types';

const PAGE_KEY = 'users';

const columns: Column<DbUser>[] = [
  { key: 'email', header: 'Email / Phone', render: (r) => r.email ?? r.phone ?? '—', sortKey: (r) => r.email ?? r.phone ?? '' },
  { key: 'wallet', header: 'Wallet', render: (r) => r.wallet_address ? `${r.wallet_address.slice(0, 6)}...${r.wallet_address.slice(-4)}` : '—' },
  { key: 'kyc', header: 'KYC', render: (r) => <StatusBadge status={r.kyc_status} /> },
  { key: 'created', header: 'Joined', render: (r) => formatDate(r.created_at), sortKey: (r) => r.created_at },
];


export default function Users() {
  const metrics = useQuery({ queryKey: [PAGE_KEY, 'metrics'], queryFn: fetchUserMetrics });
  const signups = useQuery({ queryKey: [PAGE_KEY, 'signups'], queryFn: () => fetchRecentSignups(200) });
  const segments = useQuery({ queryKey: [PAGE_KEY, 'segments'], queryFn: fetchUserSegments });
  const growth = useQuery({ queryKey: [PAGE_KEY, 'growth'], queryFn: () => fetchSignupTimeSeries('30d') });
  const dailySignups = useQuery({ queryKey: [PAGE_KEY, 'dailySignups'], queryFn: () => fetchDailySignups('30d') });

  const m = metrics.data;
  const s = segments.data;

  const segmentData = s ? [
    { name: 'Never Transacted', value: s.neverTransacted },
    { name: '1 Buy', value: s.oneBuy },
    { name: 'Repeat (2-9)', value: s.repeatBuyers },
    { name: 'Power (10+)', value: s.powerUsers },
  ] : [];

  return (
    <>
      <TopBar title="Users" pageKey={PAGE_KEY} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={m ? m.total.toLocaleString('en-IN') : '—'} loading={metrics.isLoading} />
          <MetricCard title="New (24h)" value={m ? m.newDay.toLocaleString() : '—'} loading={metrics.isLoading} />
          <MetricCard title="New (7d)" value={m ? m.newWeek.toLocaleString() : '—'} loading={metrics.isLoading} />
          <MetricCard title="New (30d)" value={m ? m.newMonth.toLocaleString() : '—'} loading={metrics.isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="User Growth (Cumulative)" loading={growth.isLoading} isEmpty={growth.data?.length === 0}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={growth.data}>
                <XAxis dataKey="date" tick={AXIS_TICK} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="count" stroke={CHART_COLORS.teal} strokeWidth={2} dot={false} name="Total Users" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New Signups Per Day" loading={dailySignups.isLoading} isEmpty={dailySignups.data?.length === 0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailySignups.data}>
                <XAxis dataKey="date" tick={AXIS_TICK} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={AXIS_TICK} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={CHART_COLORS.emerald} radius={[3, 3, 0, 0]} name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-primary mb-2 text-balance">KYC Status</h3>
            <p className="text-xs text-tertiary">Coming soon</p>
          </div>

          <ChartCard title="User Segments" loading={segments.isLoading} isEmpty={!s}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={segmentData} layout="vertical">
                <XAxis type="number" tick={AXIS_TICK} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} width={80} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill={CHART_COLORS.violet} radius={[0, 4, 4, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-3 text-balance">Recent Signups</h3>
          <DataTable columns={columns} data={signups.data ?? []} rowKey={(r) => r.id} />
        </div>
      </div>
    </>
  );
}
