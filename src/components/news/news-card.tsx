import Link from 'next/link';
import {
  cn,
  formatRelativeDate,
  truncateText,
  getReadingTime,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import type { Article } from '@/types';

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const readingTime = getReadingTime(article.content);

  if (variant === 'horizontal') {
    return (
      <article className="group flex gap-4">
        <Link
          href={`/berita/${article.slug}`}
          className="shrink-0 w-28 h-20 sm:w-36 sm:h-24 overflow-hidden rounded-lg"
        >
          <img
            src={article.featuredImage || '/placeholder-news.jpg'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <Link href={`/kategori/${article.categorySlug}`}>
            <Badge
              variant="secondary"
              className="w-fit text-[10px] px-1.5 py-0 mb-1.5 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
            >
              {article.categoryName}
            </Badge>
          </Link>
          <Link href={`/berita/${article.slug}`}>
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.authorName}
            </span>
            <span>{formatRelativeDate(article.publishedAt || article.createdAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group">
        <Link
          href={`/berita/${article.slug}`}
          className="block aspect-[16/10] overflow-hidden rounded-lg mb-3"
        >
          <img
            src={article.featuredImage || '/placeholder-news.jpg'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <Link href={`/kategori/${article.categorySlug}`}>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 mb-1.5 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
          >
            {article.categoryName}
          </Badge>
        </Link>
        <Link href={`/berita/${article.slug}`}>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {article.title}
          </h3>
        </Link>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span>{formatRelativeDate(article.publishedAt || article.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} min
          </span>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article
      className={cn(
        'group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-800'
      )}
    >
      <Link
        href={`/berita/${article.slug}`}
        className="block aspect-[16/10] overflow-hidden"
      >
        <img
          src={article.featuredImage || '/placeholder-news.jpg'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>
      <div className="p-4">
        <Link href={`/kategori/${article.categorySlug}`}>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 mb-2 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
          >
            {article.categoryName}
          </Badge>
        </Link>
        <Link href={`/berita/${article.slug}`}>
          <h3 className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {truncateText(article.excerpt, 120)}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {article.authorName}
          </span>
          <div className="flex items-center gap-3">
            <span>{formatRelativeDate(article.publishedAt || article.createdAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime} min
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
