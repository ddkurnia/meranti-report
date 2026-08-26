import { NewsCard } from '@/components/news/news-card';
import { Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Article } from '@/types';

interface NewsGridProps {
  articles: Article[];
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function NewsGrid({
  articles,
  columns = 3,
  variant = 'default',
}: NewsGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Newspaper className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">Belum ada berita</p>
        <p className="text-sm mt-1">Silakan cek kembali nanti.</p>
      </div>
    );
  }

  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridCols[columns])}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} variant={variant} />
      ))}
    </div>
  );
}
