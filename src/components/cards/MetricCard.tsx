import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/cn';

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
      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
        <div className="h-3 w-24 bg-elevated rounded" />
        <div className="h-7 w-32 bg-elevated rounded" />
        <div className="h-3 w-16 bg-elevated rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-xs font-medium text-tertiary mb-1.5 text-pretty">{title}</p>
      <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-primary truncate">
        {value}
      </p>
      <div className="flex items-center gap-2 mt-1.5">
        {subtitle && <span className="text-xs text-secondary">{subtitle}</span>}
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              trend.positive ? 'text-chart-emerald' : 'text-chart-rose'
            )}
          >
            {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
