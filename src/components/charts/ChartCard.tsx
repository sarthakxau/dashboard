import type { ReactNode } from 'react';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  isEmpty?: boolean;
  error?: string | null;
  onRetry?: () => void;
  actions?: ReactNode;
  loading?: boolean;
}

export default function ChartCard({ title, children, isEmpty, error, onRetry, actions, loading }: ChartCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-primary">{title}</h3>
        {actions}
      </div>
      {loading ? (
        <div className="h-48 bg-gray-50 rounded animate-pulse" />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        children
      )}
    </div>
  );
}
