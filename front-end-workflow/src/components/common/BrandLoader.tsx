import { Building2 } from 'lucide-react';

export function BrandLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 shadow-xl shadow-orange-500/20">
        <Building2 size={32} className="text-white" />
        <div className="absolute inset-0 rounded-2xl border-4 border-white/20 border-t-white animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-zinc-500 animate-pulse">Loading WorkFlow...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        {content}
      </div>
    );
  }

  return <div className="flex py-12 justify-center">{content}</div>;
}
