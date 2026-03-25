const styles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  claimed: 'bg-emerald-50 text-emerald-700',
  delivered: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-amber-50 text-amber-700',
  failed: 'bg-rose-50 text-rose-700',
  expired: 'bg-gray-100 text-gray-600',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
        styles[status] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  );
}
