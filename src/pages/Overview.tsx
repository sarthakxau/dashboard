import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TopBar from '@/components/layout/TopBar';
import MetricCard from '@/components/cards/MetricCard';
import ChartCard from '@/components/charts/ChartCard';
import StatusDot from '@/components/shared/StatusDot';
import { fetchOverviewMetrics, fetchDailyNewUsers, fetchDailyTxVolume } from '@/lib/queries/overview';
import { fetchLatestPrice } from '@/lib/queries/price';
import { formatINR, formatGrams, formatCompactNumber } from '@/lib/formatters';
import { GRAMS_PER_OUNCE, CHART_COLORS, PRICE_STALE_THRESHOLD_MS } from '@/lib/constants';
import Decimal from 'decimal.js';

const PAGE_KEY = 'overview';

export default function Overview() {
  const metrics = useQuery({ queryKey: [PAGE_KEY, 'metrics'], queryFn: fetchOverviewMetrics });
  const price = useQuery({ queryKey: ['price'], queryFn: fetchLatestPrice });
  const dailyUsers = useQuery({ queryKey: [PAGE_KEY, 'dailyUsers'], queryFn: () => fetchDailyNewUsers(30) });
  const dailyVolume = useQuery({ queryKey: [PAGE_KEY, 'dailyVolume'], queryFn: () => fetchDailyTxVolume(30) });

  const m = metrics.data;
  const p = price.data;

  const xautInGrams = m
    ? formatGrams(new Decimal(m.totalXaut).times(GRAMS_PER_OUNCE))
    : '—';

  const priceAge = m?.lastPriceUpdate
    ? Date.now() - new Date(m.lastPriceUpdate).getTime()
    : Infinity;
  const priceStatus = priceAge < PRICE_STALE_THRESHOLD_MS ? 'healthy' : 'error';

  return (
    <>
      <TopBar title="Overview" pageKey={PAGE_KEY} />
      <div className="p-6 space-y-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Users" value={m ? m.totalUsers.toLocaleString('en-IN') : '—'} subtitle={m ? `+${m.newUsersToday} today` : undefined} loading={metrics.isLoading} />
          <MetricCard title="Gold Under Management" value={xautInGrams} subtitle={p ? formatINR(new Decimal(m?.totalXaut ?? 0).times(p.gold_price_inr)) : undefined} loading={metrics.isLoading || price.isLoading} />
          <MetricCard title="Total INR Transacted" value={m ? formatINR(m.totalINRTransacted) : '—'} loading={metrics.isLoading} />
          <MetricCard title="Active Streaks" value={m ? m.activeStreaks.toLocaleString('en-IN') : '—'} loading={metrics.isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="New Users (Last 30 Days)" isEmpty={dailyUsers.data?.length === 0} loading={dailyUsers.isLoading} error={dailyUsers.error?.message} onRetry={() => dailyUsers.refetch()}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyUsers.data}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.1} name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Transaction Volume (Last 30 Days)" isEmpty={dailyVolume.data?.length === 0} loading={dailyVolume.isLoading} error={dailyVolume.error?.message} onRetry={() => dailyVolume.refetch()}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyVolume.data}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => formatCompactNumber(v)} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="value" fill={CHART_COLORS.blue} radius={[2, 2, 0, 0]} name="INR Volume" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-3">Quick Health Check</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <StatusDot status={priceStatus} />
              <span className="text-secondary">Price Oracle</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={m && m.failedTxs24h > 0 ? 'warning' : 'healthy'} />
              <span className="text-secondary">{m?.failedTxs24h ?? 0} failed txs (24h)</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={m && m.pendingGiftsExpiring > 0 ? 'warning' : 'healthy'} />
              <span className="text-secondary">{m?.pendingGiftsExpiring ?? 0} gifts expiring soon</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
