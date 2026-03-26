import { RefreshCw } from 'lucide-react';
import { usePageRefresh } from '@/hooks/usePageRefresh';
import { formatDateTime } from '@/lib/formatters';

export default function RefreshButton({ pageKey }: { pageKey: string }) {
  const { refresh, isRefreshing, getLastUpdated } = usePageRefresh(pageKey);
  const lastUpdated = getLastUpdated();

  return (
    <div className="flex items-center gap-2 text-xs text-tertiary">
      {lastUpdated && (
        <span className="hidden sm:inline tabular-nums">
          Updated {formatDateTime(new Date(lastUpdated))}
        </span>
      )}
      <button
        onClick={refresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-md hover:bg-elevated disabled:opacity-50"
        aria-label="Refresh data"
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
