import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TopBar from '@/components/layout/TopBar';
import MetricCard from '@/components/cards/MetricCard';
import ChartCard from '@/components/charts/ChartCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import UnitToggle from '@/components/shared/UnitToggle';
import { fetchPortfolioMetrics, fetchHoldingsDistribution, fetchTopHolders, fetchTvlTrend, type TopHolder } from '@/lib/queries/portfolio';
import { fetchLatestPrice } from '@/lib/queries/price';
import { formatINR, formatGrams } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/constants';

const PAGE_KEY = 'portfolio';
const axisTick = { fontSize: 10, fill: '#71717A' };
const tooltipStyle = { backgroundColor: '#1C1C20', border: '1px solid #27272A', borderRadius: 8 };

const LEVEL_NAMES = ['Rookie', 'Hustler', 'Grinder', 'Boss', 'Mogul', 'Legend'];

const columns: Column<TopHolder>[] = [
  { key: 'user', header: 'User ID', render: (r) => <span className="font-mono text-xs">{r.userId.slice(0, 8)}...</span> },
  { key: 'grams', header: 'Grams', render: (r) => formatGrams(r.grams), sortKey: (r) => r.grams },
  { key: 'invested', header: 'Invested', render: (r) => formatINR(r.totalInvested), sortKey: (r) => r.totalInvested },
  { key: 'pnl', header: 'PnL', render: (r) => <span className={r.pnl >= 0 ? 'text-chart-emerald' : 'text-chart-rose'}>{formatINR(r.pnl)}</span>, sortKey: (r) => r.pnl },
  { key: 'level', header: 'Level', render: (r) => LEVEL_NAMES[r.saverLevel] ?? `L${r.saverLevel}` },
];

export default function Portfolio() {
  const price = useQuery({ queryKey: ['price'], queryFn: fetchLatestPrice });
  const metrics = useQuery({
    queryKey: [PAGE_KEY, 'metrics'],
    queryFn: () => fetchPortfolioMetrics(price.data!),
    enabled: !!price.data,
  });
  const distribution = useQuery({ queryKey: [PAGE_KEY, 'distribution'], queryFn: fetchHoldingsDistribution });
  const holders = useQuery({ queryKey: [PAGE_KEY, 'holders'], queryFn: () => fetchTopHolders(50) });
  const tvlTrend = useQuery({ queryKey: [PAGE_KEY, 'tvlTrend'], queryFn: fetchTvlTrend });

  const m = metrics.data;
  const priceUnavailable = price.isSuccess && !price.data;
  const metricsLoading = !priceUnavailable && (price.isLoading || metrics.isLoading || metrics.isPending);

  return (
    <>
      <TopBar title="Portfolio" pageKey={PAGE_KEY}>
        <UnitToggle />
      </TopBar>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {priceUnavailable && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 text-xs text-amber-400">
            Price data unavailable — portfolio metrics require price history to compute TVL and PnL.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total XAUT Managed" value={m ? formatGrams(m.totalXautGrams) : priceUnavailable ? 'N/A' : '—'} loading={metricsLoading} />
          <MetricCard title="TVL (INR)" value={m ? formatINR(m.tvlINR) : priceUnavailable ? 'N/A' : '—'} loading={metricsLoading} />
          <MetricCard title="Total Invested" value={m ? formatINR(m.totalInvested) : priceUnavailable ? 'N/A' : '—'} loading={metricsLoading} />
          <MetricCard title="Avg PnL / User" value={m ? formatINR(m.avgPnl) : priceUnavailable ? 'N/A' : '—'} subtitle={m ? `${m.usersInProfit} profit / ${m.usersInLoss} loss` : undefined} loading={metricsLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Holdings Distribution" loading={distribution.isLoading} isEmpty={distribution.data?.every((b) => b.count === 0)}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={distribution.data}>
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#71717A' }} />
                <YAxis tick={axisTick} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS.gold} radius={[4, 4, 0, 0]} name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Profit vs Loss Users" loading={metricsLoading} isEmpty={!m}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={m ? [{ name: 'In Profit', value: m.usersInProfit }, { name: 'In Loss', value: m.usersInLoss }] : []}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717A' }} />
                <YAxis tick={axisTick} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Users">
                  <Cell fill={CHART_COLORS.emerald} />
                  <Cell fill={CHART_COLORS.rose} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="TVL Trend Over Time" loading={tvlTrend.isLoading} isEmpty={tvlTrend.data?.length === 0}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tvlTrend.data}>
              <XAxis dataKey="date" tick={axisTick} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={axisTick} tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatINR(v)} />
              <Line type="monotone" dataKey="tvlINR" stroke={CHART_COLORS.gold} strokeWidth={2} dot={false} name="TVL (INR)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-3 text-balance">Top Holders</h3>
          <DataTable columns={columns} data={holders.data ?? []} rowKey={(r) => r.userId} />
        </div>
      </div>
    </>
  );
}
