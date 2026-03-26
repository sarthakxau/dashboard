import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message = 'No data yet', actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-tertiary">
      <Inbox size={28} className="mb-2 opacity-40" />
      <p className="text-sm text-pretty">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-xs font-medium text-accent hover:text-accent/80"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
