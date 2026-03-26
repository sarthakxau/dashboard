import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TopBar from '@/components/layout/TopBar';
import MetricCard from '@/components/cards/MetricCard';
import ChartCard from '@/components/charts/ChartCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import DateRangeSelect from '@/components/shared/DateRangeSelect';
import { fetchGiftMetrics, fetchGiftFunnel, fetchGiftsByOccasion, fetchRecentGifts, fetchDailyGiftsSent, type RecentGift } from '@/lib/queries/gifts';
import { formatINR, formatGrams, formatDate } from '@/lib/formatters';
import { CHART_COLORS } from '@/lib/constants';
import type { DateRangePreset } from '@/types';

const PAGE_KEY = 'gifts';
const axisTick = { fontSize: 10, fill: '#71717A' };
const tooltipStyle = { backgroundColor: '#1C1C20', border: '1px solid #27272A', borderRadius: 8 };

const FUNNEL_COLORS = [CHART_COLORS.amber, CHART_COLORS.teal, CHART_COLORS.emerald, CHART_COLORS.rose];

const columns: Column<RecentGift>[] = [
  { key: 'sender', header: 'Sender', render: (r) => <span className="text-xs">{r.senderEmail}</span> },
  { key: 'recipient', header: 'Recipient', render: (r) => <span className="text-xs">{r.recipientName ?? r.recipientEmail ?? '—'}</span> },
  { key: 'amount', header: 'Amount', render: (r) => formatGrams(r.grams), sortKey: (r) => r.grams },
  { key: 'inr', header: 'INR Value', render: (r) => formatINR(r.inrAmount), sortKey: (r) => r.inrAmount },
  { key: 'occasion', header: 'Occasion', render: (r) => r.occasion },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'date', header: 'Sent', render: (r) => formatDate(r.createdAt), sortKey: (r) => r.createdAt },
  { key: 'timeToClaim', header: 'Time to Claim', render: (r) => r.timeToClaimHours !== null ? `${r.timeToClaimHours}h` : '—', sortKey: (r) => r.timeToClaimHours ?? Infinity },
];

export default function Gifts() {
  const [preset, setPreset] = useState<DateRangePreset>('30d');

  const metrics = useQuery({ queryKey: [PAGE_KEY, 'metrics', preset], queryFn: () => fetchGiftMetrics(preset) });
  const funnel = useQuery({ queryKey: [PAGE_KEY, 'funnel', preset], queryFn: () => fetchGiftFunnel(preset) });
  const occasions = useQuery({ queryKey: [PAGE_KEY, 'occasions', preset], queryFn: () => fetchGiftsByOccasion(preset) });
  const recent = useQuery({ queryKey: [PAGE_KEY, 'recent', preset], queryFn: () => fetchRecentGifts(preset) });
  const dailyGifts = useQuery({ queryKey: [PAGE_KEY, 'daily', preset], queryFn: () => fetchDailyGiftsSent(preset) });

  const m = metrics.data;

  return (
    <>
      <TopBar title="Gifts" pageKey={PAGE_KEY}>
        <DateRangeSelect value={preset} onChange={setPreset} />
      </TopBar>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Sent" value={m ? m.totalSent.toLocaleString() : '—'} loading={metrics.isLoading} />
          <MetricCard title="Claimed" value={m ? m.totalClaimed.toLocaleString() : '—'} subtitle={m ? `${m.claimRate.toFixed(1)}% rate` : undefined} loading={metrics.isLoading} />
          <MetricCard title="Total XAUT Gifted" value={m ? formatGrams(m.totalXautGifted) : '—'} loading={metrics.isLoading} />
          <MetricCard title="Avg Gift Size" value={m ? formatINR(m.avgGiftSizeINR) : '—'} subtitle={m ? `${m.expiredCount} expired` : undefined} loading={metrics.isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Gift Funnel" loading={funnel.isLoading} isEmpty={funnel.data?.every((s) => s.count === 0)}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnel.data}>
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#71717A' }} />
                <YAxis tick={axisTick} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Gifts">
                  {(funnel.data ?? []).map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Gifts by Occasion" loading={occasions.isLoading} isEmpty={occasions.data?.length === 0}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={occasions.data} layout="vertical">
                <XAxis type="number" tick={axisTick} />
                <YAxis type="category" dataKey="occasion" tick={axisTick} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS.violet} radius={[0, 4, 4, 0]} name="Gifts" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Daily Gifts Sent" loading={dailyGifts.isLoading} isEmpty={dailyGifts.data?.length === 0}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyGifts.data}>
              <XAxis dataKey="date" tick={axisTick} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke={CHART_COLORS.violet} strokeWidth={2} dot={false} name="Gifts Sent" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-3 text-balance">Recent Gifts</h3>
          <DataTable columns={columns} data={recent.data ?? []} rowKey={(r) => r.id} />
        </div>
      </div>
    </>
  );
}
