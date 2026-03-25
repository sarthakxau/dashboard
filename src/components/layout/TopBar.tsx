import RefreshButton from '@/components/shared/RefreshButton';

interface TopBarProps {
  title: string;
  pageKey: string;
  children?: React.ReactNode;
}

export default function TopBar({ title, pageKey, children }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        {children}
        <RefreshButton pageKey={pageKey} />
      </div>
    </header>
  );
}
