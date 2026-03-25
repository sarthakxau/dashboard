import { RefreshCw } from 'lucide-react';
import { usePageRefresh } from '@/hooks/usePageRefresh';
import { formatRelativeTime } from '@/lib/formatters';

export default function RefreshButton({ pageKey }: { pageKey: string }) {
  const { refresh, isRefreshing, getLastUpdated } = usePageRefresh(pageKey);
  const lastUpdated = getLastUpdated();

  return (
    <div className="flex items-center gap-2 text-xs text-secondary">
      {lastUpdated && (
        <span>Updated {formatRelativeTime(new Date(lastUpdated))}</span>
      )}
      <button
        onClick={refresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
        aria-label="Refresh data"
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
