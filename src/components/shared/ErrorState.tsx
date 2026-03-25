import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Failed to load data', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-secondary">
      <AlertCircle size={24} className="mb-2 text-rose-400" />
      <p className="text-sm mb-2">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-accent hover:underline">
          Retry
        </button>
      )}
    </div>
  );
}
