import type { DateRangePreset } from '@/types';

const presets: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7d' },
  { value: '30d', label: 'Last 30d' },
  { value: '90d', label: 'Last 90d' },
  { value: 'all', label: 'All time' },
];

interface DateRangeSelectProps {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
}

export default function DateRangeSelect({ value, onChange }: DateRangeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DateRangePreset)}
      className="text-xs border border-border rounded-md px-2 py-1 bg-white text-primary"
    >
      {presets.map((p) => (
        <option key={p.value} value={p.value}>{p.label}</option>
      ))}
    </select>
  );
}
