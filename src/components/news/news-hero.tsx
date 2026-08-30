import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatRelativeDate, getReadingTime } from '@/lib/utils';
import type { Article } from '@/types';

interface TopNewsProps {
  article: Article;
  supporting: Article[];
}

export function NewsHero({ article: main, supporting: allSupporting }: TopNewsProps) {
  const supporting = allSupporting.slice(0, 4);
  const mainReadTime = getReadingTime(main.content);

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 md:py-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-red-600 rounded-full" />
        <h2 className="text-lg font-bold tracking-tight">Top News</h2>
      </div>

      {/* Desktop: side by side */}
      <div className="hidden md:grid md:grid-cols-5 gap-4">
        {/* Main article — 3 cols */}
        <Link href={`/berita/${main.slug}`} className="md:col-span-3 group relative rounded-xl overflow-hidden block h-[350px] lg:h-[450px]">
          <img
            src={main.featuredImage || '/placeholder-news.jpg'}
            alt={main.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <Badge className="bg-red-600 text-white text-[10px] w-fit mb-2">
              {main.categoryName}
            </Badge>
            <h3 className="text-xl lg:text-2xl font-bold text-white leading-snug line-clamp-3">
              {main.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-300">
              <span>{formatRelativeDate(main.publishedAt || main.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {mainReadTime} min
              </span>
            </div>
          </div>
        </Link>

        {/* Supporting articles — 2 cols */}
        <div className="md:col-span-2 grid grid-rows-2 gap-4">
          {supporting.map((article) => (
            <Link
              key={article.id}
              href={`/berita/${article.slug}`}
              className="group relative rounded-xl overflow-hidden block"
            >
              <img
                src={article.featuredImage || '/placeholder-news.jpg'}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <Badge className="bg-red-600 text-white text-[10px] w-fit mb-1.5">
                  {article.categoryName}
                </Badge>
                <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                  {article.title}
                </h4>
                <span className="mt-1 text-[11px] text-gray-300">
                  {formatRelativeDate(article.publishedAt || article.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile: main full width, then horizontal cards */}
      <div className="md:hidden">
        {/* Main article */}
        <Link href={`/berita/${main.slug}`} className="group relative rounded-xl overflow-hidden block h-[300px] sm:h-[380px]">
          <img
            src={main.featuredImage || '/placeholder-news.jpg'}
            alt={main.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <Badge className="bg-red-600 text-white text-[10px] w-fit mb-2">
              {main.categoryName}
            </Badge>
            <h3 className="text-lg font-bold text-white leading-snug line-clamp-3">
              {main.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-300">
              <span>{formatRelativeDate(main.publishedAt || main.createdAt)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {mainReadTime} min
              </span>
            </div>
          </div>
        </Link>

        {/* Supporting — horizontal scroll cards */}
        {supporting.length > 0 && (
          <div className="mt-3 flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1 scrollbar-hide">
            {supporting.map((article) => (
              <Link
                key={article.id}
                href={`/berita/${article.slug}`}
                className="group flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
              >
                <div className="flex gap-2.5 items-start bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2.5 transition-colors hover:border-red-300 dark:hover:border-red-800">
                  <img
                    src={article.featuredImage || '/placeholder-news.jpg'}
                    alt={article.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <Badge className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] px-1.5 py-0 mb-1">
                      {article.categoryName}
                    </Badge>
                    <h4 className="text-xs font-semibold leading-snug line-clamp-2 text-gray-900 dark:text-white">
                      {article.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      {formatRelativeDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}