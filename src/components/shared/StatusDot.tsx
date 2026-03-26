type Status = 'healthy' | 'warning' | 'error';

const colors: Record<Status, string> = {
  healthy: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
};

export default function StatusDot({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block size-2 rounded-full ${colors[status]}`}
      aria-label={status}
    />
  );
}
