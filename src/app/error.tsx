'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Terjadi Kesalahan</h1>
        <p className="text-muted-foreground mt-3">
          {error.message || 'Sesuatu yang tidak terduga terjadi. Silakan coba lagi.'}
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </Button>
          <Link href="/">
            <Button className="gap-2 bg-[#1a2332] hover:bg-[#2a3a52]">
              <Home className="h-4 w-4" />
              Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
