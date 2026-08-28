import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight } from 'lucide-react';
import {
  formatRelativeDate,
  getReadingTime,
} from '@/lib/utils';
import type { Article } from '@/types';

interface NewsHeroProps {
  article: Article;
}

export function NewsHero({ article }: NewsHeroProps) {
  const readingTime = getReadingTime(article.content);

  return (
    <section className="relative w-full h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[70vh] overflow-hidden">
      {/* Background image */}
      <img
        src={article.featuredImage || '/placeholder-news.jpg'}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

      {/* Content overlay at bottom */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:pb-12 md:pb-16">
          <div className="max-w-3xl">
            <Link href={`/kategori/${article.categorySlug}`}>
              <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs mb-3 sm:mb-4 cursor-pointer">
                {article.categoryName}
              </Badge>
            </Link>
            <Link href={`/berita/${article.slug}`}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight sm:leading-tight md:leading-tight">
                {article.title}
              </h1>
            </Link>
            {article.excerpt && (
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-200 line-clamp-2 sm:line-clamp-3 max-w-2xl">
                {article.excerpt}
              </p>
            )}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {article.authorName}
              </span>
              <span>{formatRelativeDate(article.publishedAt || article.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime} min baca
              </span>
            </div>
            <Link href={`/berita/${article.slug}`} className="inline-block mt-5 sm:mt-6">
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 rounded-sm">
                Baca Selengkapnya
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
