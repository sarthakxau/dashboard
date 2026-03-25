import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TopBar from '@/components/layout/TopBar';
import MetricCard from '@/components/cards/MetricCard';
import ChartCard from '@/components/charts/ChartCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import UnitToggle from '@/components/shared/UnitToggle';
import DateRangeSelect from '@/components/shared/DateRangeSelect';
import { fetchTransactionMetrics, fetchRecentTransactions, fetchVolumeTimeSeries, fetchHourlyDistribution, fetchBuySellRatio, fetchOrderSizeDistribution } from '@/lib/queries/transactions';
import { fetchLatestPrice } from '@/lib/queries/price';
import { formatINR, formatINRValue, formatDateTime, getExplorerUrl, truncateHash } from '@/lib/formatters';
import { useUnit } from '@/contexts/UnitContext';
import { CHART_COLORS } from '@/lib/constants';
import type { DateRangePreset, DbTransaction, Unit } from '@/types';

const PAGE_KEY = 'transactions';

function getColumns(unit: Unit, price: { gold_price_usd: number; gold_price_inr: number; usd_inr_rate: number } | null): Column<DbTransaction>[] {
  const fmtAmount = (inr: number) => {
    if (!price) return formatINR(inr);
    return formatINRValue(inr, unit, { ...price, timestamp: '' });
  };

  return [
    { key: 'type', header: 'Type', render: (r) => <span className={r.type === 'buy' ? 'text-emerald-600' : 'text-rose-600'}>{r.type.toUpperCase()}</span> },
    { key: 'amount', header: `Amount (${unit})`, render: (r) => r.inr_amount ? fmtAmount(r.inr_amount) : '—', sortKey: (r) => r.inr_amount ?? 0 },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'tx', header: 'Tx Hash', render: (r) => {
      const hash = r.dex_swap_tx_hash ?? r.blockchain_tx_hash;
      if (!hash) return '—';
      return <a href={getExplorerUrl(hash, r.created_at)} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-mono text-xs">{truncateHash(hash)}</a>;
    }},
    { key: 'date', header: 'Date', render: (r) => formatDateTime(r.created_at), sortKey: (r) => r.created_at },
  ];
}

export default function Transactions() {
  const { unit } = useUnit();
  const [preset, setPreset] = useState<DateRangePreset>('30d');
  const [typeFilter, setTypeFilter] = useState<'buy' | 'sell' | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const price = useQuery({ queryKey: ['price'], queryFn: fetchLatestPrice });
  const metrics = useQuery({ queryKey: [PAGE_KEY, 'metrics', preset], queryFn: () => fetchTransactionMetrics(preset) });
  const txList = useQuery({ queryKey: [PAGE_KEY, 'list', preset, typeFilter, statusFilter], queryFn: () => fetchRecentTransactions(preset, {
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  })});
  const volume = useQuery({ queryKey: [PAGE_KEY, 'volume', preset], queryFn: () => fetchVolumeTimeSeries(preset) });
  const hourly = useQuery({ queryKey: [PAGE_KEY, 'hourly', preset], queryFn: () => fetchHourlyDistribution(preset) });
  const ratio = useQuery({ queryKey: [PAGE_KEY, 'ratio', preset], queryFn: () => fetchBuySellRatio(preset) });
  const orderSizes = useQuery({ queryKey: [PAGE_KEY, 'orderSizes', preset], queryFn: () => fetchOrderSizeDistribution(preset) });

  const m = metrics.data;
  const p = price.data ?? null;

  const fmtINR = (v: number) => {
    if (!p) return formatINR(v);
    return formatINRValue(v, unit, { ...p, timestamp: '' });
  };

  const columns = getColumns(unit, p);

  return (
    <>
      <TopBar title="Transactions" pageKey={PAGE_KEY}>
        <DateRangeSelect value={preset} onChange={setPreset} />
        <UnitToggle />
      </TopBar>
      <div className="p-6 space-y-6 max-w-7xl">
        {!p && unit !== 'INR' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700">
            Price data unavailable — showing values in INR. Unit conversion requires price history.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Buy Volume" value={m ? fmtINR(m.buyVolumeINR) : '—'} subtitle={m ? `${m.buyCount} orders` : undefined} loading={metrics.isLoading} />
          <MetricCard title="Sell Volume" value={m ? fmtINR(m.sellVolumeINR) : '—'} subtitle={m ? `${m.sellCount} orders` : undefined} loading={metrics.isLoading} />
          <MetricCard title="Avg Order Size" value={m ? fmtINR(m.avgOrderSize) : '—'} loading={metrics.isLoading} />
          <MetricCard title="Success Rate" value={m ? `${m.successRate.toFixed(1)}%` : '—'} subtitle={m ? `${m.failedCount} failed` : undefined} loading={metrics.isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Daily Volume (Buy vs Sell)" loading={volume.isLoading} isEmpty={volume.data?.length === 0}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volume.data}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmtINR(v)} />
                <Legend />
                <Bar dataKey="buy" fill={CHART_COLORS.blue} stackId="a" radius={[2, 2, 0, 0]} name="Buy" />
                <Bar dataKey="sell" fill={CHART_COLORS.emerald} stackId="a" name="Sell" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Buy/Sell Ratio Over Time" loading={ratio.isLoading} isEmpty={ratio.data?.length === 0}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ratio.data}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="ratio" stroke={CHART_COLORS.amber} strokeWidth={2} dot={false} name="Buy/Sell Ratio" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Order Size Distribution" loading={orderSizes.isLoading} isEmpty={orderSizes.data?.every((b) => b.count === 0)}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderSizes.data}>
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Transactions by Hour (IST)" loading={hourly.isLoading} isEmpty={hourly.data?.every((h) => h.count === 0)}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourly.data}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h: number) => `${h}:00`} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip labelFormatter={(h: number) => `${h}:00 - ${h + 1}:00`} />
                <Bar dataKey="count" fill={CHART_COLORS.violet} radius={[2, 2, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-primary">Recent Transactions</h3>
            <div className="flex gap-2">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className="text-xs border border-border rounded px-2 py-1 bg-white">
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs border border-border rounded px-2 py-1 bg-white">
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <DataTable columns={columns} data={txList.data ?? []} rowKey={(r) => r.id} />
        </div>
      </div>
    </>
  );
}
