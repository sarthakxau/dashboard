import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean } | null;
  loading?: boolean;
}

export default function MetricCard({ title, value, subtitle, trend, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
        <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
        <div className="h-7 w-28 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs font-medium text-secondary mb-1">{title}</p>
      <p className="text-2xl font-semibold font-mono text-primary">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {subtitle && <span className="text-xs text-secondary">{subtitle}</span>}
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
