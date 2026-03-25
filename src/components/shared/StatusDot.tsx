type Status = 'healthy' | 'warning' | 'error';

const colors: Record<Status, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
};

export default function StatusDot({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${colors[status]}`}
      aria-label={status}
    />
  );
}
