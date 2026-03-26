import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PAGE_SIZES } from '@/lib/constants';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortKey?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
}

export default function DataTable<T>({ columns, data, rowKey }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.key === sortCol);
    if (!col?.sortKey) return data;
    const fn = col.sortKey;
    return [...data].sort((a, b) => {
      const va = fn(a);
      const vb = fn(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortCol, sortDir, columns]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('desc');
    }
    setPage(0);
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'text-left px-3 py-2.5 text-xs font-medium text-tertiary select-none',
                    col.sortKey && 'cursor-pointer'
                  )}
                  onClick={() => col.sortKey && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortCol === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border/40 hover:bg-white/[0.02]">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 text-primary tabular-nums">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-xs text-secondary">
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="border border-white/[0.08] rounded px-1.5 py-0.5 bg-black/20 text-secondary text-xs"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            {sorted.length === 0
              ? 'No rows'
              : `${page * pageSize + 1}\u2013${Math.min((page + 1) * pageSize, sorted.length)} of ${sorted.length}`}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-0.5 rounded border border-border disabled:opacity-30 hover:bg-elevated text-secondary"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-0.5 rounded border border-border disabled:opacity-30 hover:bg-elevated text-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
