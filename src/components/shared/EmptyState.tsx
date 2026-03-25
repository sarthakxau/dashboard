import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data yet' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-secondary">
      <Inbox size={32} className="mb-2 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
