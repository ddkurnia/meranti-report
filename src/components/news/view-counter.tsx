'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ViewCounterProps {
  articleId: string;
  initialViews?: number;
}

export function ViewCounter({ articleId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(initialViews ?? null);

  useEffect(() => {
    if (initialViews !== undefined) {
      setViews(initialViews);
    }
  }, [initialViews]);

  useEffect(() => {
    async function fetchViews() {
      try {
        const res = await fetch(`/api/views?articleId=${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setViews(data.data?.views ?? data.views ?? null);
        }
      } catch {
        // Silently fail
      }
    }
    fetchViews();

    // Poll for live view count updates every 30 seconds
    const interval = setInterval(fetchViews, 30000);
    return () => clearInterval(interval);
  }, [articleId]);

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="h-3.5 w-3.5" />
      {views !== null ? `${formatNumber(views)} views` : '- views'}
    </span>
  );
}
