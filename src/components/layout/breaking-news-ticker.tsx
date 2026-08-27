'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealtimeBreakingNews } from '@/hooks/use-realtime';
import type { Article } from '@/types';

export function BreakingNewsTicker() {
  const { articles, loading } = useRealtimeBreakingNews();
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('breaking-news-dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem('breaking-news-dismissed', 'true');
  }, []);

  if (dismissed || (articles.length === 0 && !loading)) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-3">
          <span className="shrink-0 bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-sm">
            BREAKING
          </span>
          <Skeleton className="h-4 flex-1 bg-red-500/50" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-red-600 text-white relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-3">
        <span className="shrink-0 bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-sm animate-pulse">
          BREAKING
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="flex whitespace-nowrap animate-ticker">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/berita/${article.slug}`}
                className="inline-flex items-center text-sm md:text-base hover:underline underline-offset-2"
              >
                <span className="font-medium">{article.title}</span>
                {index < articles.length - 1 && (
                  <span className="mx-6 text-red-200">•</span>
                )}
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 hover:bg-red-700 rounded-sm p-0.5 transition-colors"
          aria-label="Tutup breaking news"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
