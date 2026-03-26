import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-tertiary">
      <AlertCircle size={24} className="mb-2 text-chart-rose" />
      <p className="text-sm mb-2 text-pretty">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-medium text-accent hover:text-accent/80">
          Retry
        </button>
      )}
    </div>
  );
}
