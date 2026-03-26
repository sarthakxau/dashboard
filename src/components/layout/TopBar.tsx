import RefreshButton from '@/components/shared/RefreshButton';

interface TopBarProps {
  title: string;
  pageKey: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, pageKey, children }: TopBarProps) {
  return (
    <header className="sticky top-0 z-header bg-background/80 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <h1 className="text-base font-semibold text-primary truncate text-balance">{title}</h1>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {children}
        <RefreshButton pageKey={pageKey} />
      </div>
    </header>
  );
}
