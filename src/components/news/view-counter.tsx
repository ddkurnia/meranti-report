'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ViewCounterProps {
  articleId: string;
}

export function ViewCounter({ articleId }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

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
  }, [articleId]);

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="h-3.5 w-3.5" />
      {views !== null ? `${formatNumber(views)} views` : '- views'}
    </span>
  );
}
