import { cn } from '@/lib/cn';

const styles: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400',
  claimed: 'bg-emerald-500/10 text-emerald-400',
  delivered: 'bg-sky-500/10 text-sky-400',
  pending: 'bg-amber-500/10 text-amber-400',
  processing: 'bg-amber-500/10 text-amber-400',
  failed: 'bg-rose-500/10 text-rose-400',
  expired: 'bg-zinc-500/10 text-zinc-400',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 text-xs font-medium rounded-full',
        styles[status] ?? 'bg-zinc-500/10 text-zinc-400'
      )}
    >
      {status}
    </span>
  );
}
