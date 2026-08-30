'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BreakingNewsTicker } from '@/components/layout/breaking-news-ticker';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NewsHero } from '@/components/news/news-hero';
import { NewsGrid } from '@/components/news/news-grid';
import { NewsCard } from '@/components/news/news-card';
import { NewsletterSection } from '@/components/news/newsletter-section';
import { AdSlotRenderer } from '@/components/ads/ad-banner';
import { ChevronRight, TrendingUp, Newspaper, ArrowRight, Zap, FolderOpen } from 'lucide-react';
import { useHomepageData } from '@/hooks/use-realtime';
import type { Article, Category, AdSlot } from '@/types';

export default function HomePage() {
  const { breaking, featured, latest: realtimeArticles, categories, ads, loading } = useHomepageData();

  const featuredArticle = featured && featured.length > 0
    ? featured[0]
    : realtimeArticles && realtimeArticles.length > 0
      ? realtimeArticles[0]
      : null;

  // Supporting articles for Top News (exclude main)
  const supportingArticles = (realtimeArticles || [])
    .filter((a: Article) => a.id !== featuredArticle?.id)
    .slice(0, 4);

  // When there are few articles, include the featured article in the grid too
  const hasManyArticles = (realtimeArticles || []).length > 7;

  // For Berita Terbaru, skip those already in Top News
  const topNewsIds = new Set([
    featuredArticle?.id,
    ...supportingArticles.map((a: Article) => a.id),
  ].filter(Boolean));

  const latestArticles = (realtimeArticles || [])
    .filter((a: Article) => !topNewsIds.has(a.id))
    .slice(0, 6);

  const popularArticles = [...(realtimeArticles || [])]
    .sort((a: Article, b: Article) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const pilihanArticles = (realtimeArticles || [])
    .filter((a: Article) => a.featured || a.breaking)
    .filter((a: Article) => hasManyArticles ? a.id !== featuredArticle?.id : true)
    .slice(0, 3);

  const moreArticles = hasManyArticles ? (realtimeArticles || []).slice(7, 13) : [];

  // Split latest articles for in-feed ad
  const firstRow = latestArticles.slice(0, 3);
  const secondRow = latestArticles.slice(3, 6);

  return (
    <>
      <BreakingNewsTicker />
      <Header />

      <main className="flex-1">
        {/* ====== SLOT 1: Header Banner ====== */}
        <div className="mx-auto max-w-7xl px-4 pt-3">
          <AdSlotRenderer ads={ads} slotId="slot-1" />
        </div>

        {/* Top News Section */}
        {loading ? (
          <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
            <Skeleton className="h-5 w-28 mb-4" />
            <div className="grid md:grid-cols-5 gap-4">
              <Skeleton className="md:col-span-3 h-[300px] md:h-[350px] lg:h-[450px] rounded-xl" />
              <div className="md:col-span-2 grid grid-rows-2 gap-4">
                <Skeleton className="rounded-xl" />
                <Skeleton className="rounded-xl" />
              </div>
            </div>
          </div>
        ) : featuredArticle ? (
          <NewsHero article={featuredArticle} supporting={supportingArticles} />
        ) : null}

        {/* ====== SLOT 2: After Hero ====== */}
        <div className="mx-auto max-w-7xl px-4 pt-6">
          <AdSlotRenderer ads={ads} slotId="slot-2" />
        </div>

        {/* Berita Terbaru */}
        <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <SectionHeader title="Berita Terbaru" icon={<Newspaper className="h-5 w-5" />} />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between pt-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* First row of articles */}
              <NewsGrid articles={firstRow} columns={3} />

              {/* ====== SLOT 3: In-Feed 1 (between article rows) ====== */}
              <div className="my-6">
                <AdSlotRenderer ads={ads} slotId="slot-3" />
              </div>

              {/* Second row of articles */}
              <NewsGrid articles={secondRow} columns={3} />
            </>
          )}
        </section>

        <Separator className="mx-auto max-w-7xl" />

        {/* ====== SLOT 7: Mid Page 1 (after Berita Terbaru) ====== */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <AdSlotRenderer ads={ads} slotId="slot-7" />
        </div>

        {/* Sidebar Layout: Popular + Pilihan */}
        <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Left: Berita Populer */}
            <div className="lg:col-span-2">
              <SectionHeader title="Berita Populer" icon={<TrendingUp className="h-5 w-5" />} />
              {loading ? (
                <div className="space-y-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-28 h-20 sm:w-36 sm:h-24 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {popularArticles.map((article, index) => (
                    <div key={article.id}>
                      <div className="flex gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                        <span className="hidden sm:flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-bold text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <NewsCard article={article} variant="horizontal" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <aside className="space-y-8">
              {/* ====== SLOT 4: Sidebar Atas ====== */}
              <AdSlotRenderer ads={ads} slotId="slot-4" />

              {/* Berita Pilihan */}
              {pilihanArticles.length > 0 && (
                <div>
                  <SectionHeader title="Berita Pilihan" icon={<Zap className="h-4 w-4" />} />
                  <div className="space-y-4">
                    {pilihanArticles.map((article) => (
                      <article key={article.id} className="group">
                        <Link href={`/berita/${article.slug}`}>
                          <div className="flex gap-3 items-start">
                            <img
                              src={article.featuredImage || '/placeholder-news.jpg'}
                              alt={article.title}
                              className="w-20 h-14 rounded-lg object-cover shrink-0 transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <Link href={`/kategori/${article.categorySlug}`}>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mb-1 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                  {article.categoryName}
                                </Badge>
                              </Link>
                              <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {article.title}
                              </h4>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* ====== SLOT 5: Sidebar Tengah ====== */}
              <AdSlotRenderer ads={ads} slotId="slot-5" />

              {/* Category List */}
              {(categories || []).length > 0 && (
                <div>
                  <SectionHeader title="Kategori" icon={null} />
                  <div className="grid grid-cols-2 gap-2">
                    {(categories || []).slice(0, 8).map((cat: Category) => (
                      <Link
                        key={cat.id}
                        href={`/kategori/${cat.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                        <span className="truncate">{cat.name}</span>
                        <span className="ml-auto text-xs text-gray-400">{cat.articleCount || 0}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/kategori"
                    className="mt-3 flex items-center justify-center gap-1 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Lihat Semua Kategori
                  </Link>
                </div>
              )}

              {/* ====== SLOT 6: Sidebar Bawah ====== */}
              <AdSlotRenderer ads={ads} slotId="slot-6" />
            </aside>
          </div>
        </section>

        {/* ====== SLOT 8: Mid Page 2 (before Category Sections) ====== */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <AdSlotRenderer ads={ads} slotId="slot-8" />
        </div>

        {/* Berita per Kategori — top categories with their latest articles */}
        {!loading && (categories || []).length > 0 && (
          <CategorySections categories={(categories || []) as Category[]} articles={realtimeArticles || []} />
        )};

        {/* More News */}
        {moreArticles.length > 0 && (
          <>
            <Separator className="mx-auto max-w-7xl" />
            <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
              <SectionHeader
                title="Berita Lainnya"
                icon={<ArrowRight className="h-5 w-5" />}
              />
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <NewsGrid articles={moreArticles} columns={3} variant="compact" />
              )}
            </section>
          </>
        )}

        {/* ====== SLOT 9: Pre-Newsletter ====== */}
        <div className="mx-auto max-w-7xl px-4 py-4">
          <AdSlotRenderer ads={ads} slotId="slot-9" />
        </div>

        <NewsletterSection />

        {/* ====== SLOT 10: Footer Banner ====== */}
        <div className="mx-auto max-w-7xl px-4 pt-4 pb-2">
          <AdSlotRenderer ads={ads} slotId="slot-10" />
        </div>
      </main>

      <Footer />
    </>
  );
}

function SectionHeader({
  title,
  icon,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-red-600">{icon}</span>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      {href && (
        <Link href={href} className="text-sm text-red-600 dark:text-red-400 hover:underline whitespace-nowrap flex items-center gap-1">
          Lihat Semua
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

/** Shows top categories with their 3 most recent articles */
function CategorySections({
  categories,
  articles,
}: {
  categories: Category[];
  articles: Article[];
}) {
  // Get top 4 categories by article count (that actually have articles)
  const topCategories = categories
    .filter((c) => (c.articleCount || 0) > 0)
    .sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0))
    .slice(0, 4);

  if (topCategories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <SectionHeader
        title="Berita per Kategori"
        icon={<FolderOpen className="h-5 w-5" />}
        href="/kategori"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {topCategories.map((cat) => {
          const catArticles = articles
            .filter((a) => a.categoryId === cat.id)
            .slice(0, 3);
          if (catArticles.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-3">
              <Link
                href={`/kategori/${cat.slug}`}
                className="inline-flex items-center gap-2 text-base font-bold hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <span className="w-1 h-5 bg-red-600 rounded-full" />
                {cat.name}
                <Badge variant="secondary" className="font-mono text-xs ml-1">
                  {cat.articleCount || 0}
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <div className="space-y-1">
                {catArticles.map((article) => (
                  <NewsCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
