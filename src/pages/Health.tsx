import { useQuery } from '@tanstack/react-query';
import TopBar from '@/components/layout/TopBar';
import StatusDot from '@/components/shared/StatusDot';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { fetchPriceOracleStatus, fetchFailedTxSummary, fetchStaleData, fetchDbStats, type DbTableStat } from '@/lib/queries/health';
import { formatINR, formatUSD, formatDateTime, getExplorerUrl, truncateHash } from '@/lib/formatters';
import { PRICE_STALE_THRESHOLD_MS } from '@/lib/constants';
import type { DbTransaction } from '@/types';

const PAGE_KEY = 'health';

const failedColumns: Column<DbTransaction>[] = [
  { key: 'type', header: 'Type', render: (r) => r.type.toUpperCase() },
  { key: 'amount', header: 'Amount', render: (r) => r.inr_amount ? formatINR(r.inr_amount) : '—' },
  { key: 'error', header: 'Error', render: (r) => <span className="text-xs text-chart-rose max-w-xs truncate block">{r.error_message ?? '—'}</span> },
  { key: 'tx', header: 'Tx Hash', render: (r) => {
    const hash = r.dex_swap_tx_hash ?? r.blockchain_tx_hash;
    if (!hash) return '—';
    return <a href={getExplorerUrl(hash, r.created_at)} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 font-mono text-xs">{truncateHash(hash)}</a>;
  }},
  { key: 'date', header: 'Date', render: (r) => formatDateTime(r.created_at), sortKey: (r) => r.created_at },
];

const dbColumns: Column<DbTableStat>[] = [
  { key: 'table', header: 'Table', render: (r) => <span className="font-mono text-xs">{r.table}</span> },
  { key: 'count', header: 'Rows', render: (r) => r.count.toLocaleString('en-IN'), sortKey: (r) => r.count },
];

export default function Health() {
  const oracle = useQuery({ queryKey: [PAGE_KEY, 'oracle'], queryFn: fetchPriceOracleStatus });
  const failed = useQuery({ queryKey: [PAGE_KEY, 'failed'], queryFn: fetchFailedTxSummary });
  const stale = useQuery({ queryKey: [PAGE_KEY, 'stale'], queryFn: fetchStaleData });
  const dbStats = useQuery({ queryKey: [PAGE_KEY, 'dbStats'], queryFn: fetchDbStats });

  const o = oracle.data;
  const f = failed.data;
  const s = stale.data;

  const hasOracleError = !!oracle.error;
  const priceAge = o?.lastUpdate ? Date.now() - new Date(o.lastUpdate).getTime() : Infinity;
  const priceStatus: 'healthy' | 'warning' | 'error' = hasOracleError
    ? 'error'
    : priceAge < PRICE_STALE_THRESHOLD_MS ? 'healthy' : priceAge < 15 * 60 * 1000 ? 'warning' : 'error';

  const oracleStatusText = hasOracleError
    ? `Error: ${oracle.error.message}`
    : oracle.isLoading
      ? 'Loading\u2026'
      : o?.lastUpdate
        ? `Updated ${formatDateTime(o.lastUpdate)}`
        : 'No price data in database';

  return (
    <>
      <TopBar title="Health" pageKey={PAGE_KEY} />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl">
        {/* Price Oracle */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-4 text-balance">Price Oracle</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-tertiary mb-1">Status</p>
              <div className="flex items-center gap-2">
                <StatusDot status={priceStatus} />
                <span className="text-secondary">{oracleStatusText}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-tertiary mb-1">Gold Price (USD)</p>
              <p className="font-mono tabular-nums">{o?.currentPriceUSD ? formatUSD(o.currentPriceUSD) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-tertiary mb-1">Gold Price (INR)</p>
              <p className="font-mono tabular-nums">{o?.currentPriceINR ? formatINR(o.currentPriceINR) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-tertiary mb-1">24h Range (USD)</p>
              <p className="font-mono tabular-nums">
                {o?.price24hLowUSD && o?.price24hHighUSD
                  ? `${formatUSD(o.price24hLowUSD)} — ${formatUSD(o.price24hHighUSD)}`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-tertiary mb-1">Price Gaps (7d)</p>
              <p className="font-mono tabular-nums">{o?.priceGaps7d ?? '—'} gaps (&gt;10 min)</p>
            </div>
          </div>
        </div>

        {/* Failed Transactions */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-4 text-balance">Failed Transactions</h3>
          <div className="flex flex-wrap gap-4 sm:gap-6 mb-4 text-sm">
            <div>
              <p className="text-xs text-tertiary">Last 24h</p>
              <p className="text-lg font-semibold font-mono tabular-nums text-chart-rose">{f?.count24h ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-tertiary">Last 7d</p>
              <p className="text-lg font-semibold font-mono tabular-nums text-chart-rose">{f?.count7d ?? '—'}</p>
            </div>
          </div>

          {f?.errorGroups && f.errorGroups.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-tertiary mb-2">Error Groups</p>
              <div className="space-y-1">
                {f.errorGroups.slice(0, 5).map((eg) => (
                  <div key={eg.error} className="flex justify-between text-xs">
                    <span className="text-chart-rose truncate max-w-[200px] sm:max-w-md">{eg.error}</span>
                    <span className="text-secondary font-mono tabular-nums">{eg.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DataTable columns={failedColumns} data={f?.recentFailed ?? []} rowKey={(r) => r.id} />
        </div>

        {/* Stale Data */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-4 text-balance">Stale Data Alerts</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <StatusDot status={s && s.stalePendingTxs > 0 ? 'warning' : 'healthy'} />
              <span className="text-secondary">{s?.stalePendingTxs ?? 0} pending txs older than 10 min</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={s && s.giftsExpiringIn48h > 0 ? 'warning' : 'healthy'} />
              <span className="text-secondary">{s?.giftsExpiringIn48h ?? 0} gifts expiring within 48h</span>
            </div>
          </div>
        </div>

        {/* DB Stats */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-primary mb-3 text-balance">Database Stats</h3>
          <DataTable columns={dbColumns} data={dbStats.data ?? []} rowKey={(r) => r.table} />
        </div>
      </div>
    </>
  );
}
