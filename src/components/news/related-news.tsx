'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsGrid } from '@/components/news/news-grid';
import type { Article } from '@/types';

interface RelatedNewsProps {
  currentArticleId: string;
  categoryId: string;
  tags?: string[];
}

export function RelatedNews({ currentArticleId, categoryId }: RelatedNewsProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          related: 'true',
          categoryId,
          exclude: currentArticleId,
          limit: '4',
        });
        const res = await fetch(`/api/articles?${params}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.data || data || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [currentArticleId, categoryId]);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-6">Berita Terkait</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/10] w-full rounded-lg" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-6">Berita Terkait</h2>
      <NewsGrid articles={articles} columns={4} variant="compact" />
    </section>
  );
}
