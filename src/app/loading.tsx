import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a2332] dark:text-gray-400" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}