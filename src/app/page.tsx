'use client';

import { useEffect, useState } from 'react';
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
import { ChevronRight, TrendingUp, Newspaper, ArrowRight, Zap } from 'lucide-react';
import type { Article, Category } from '@/types';

export default function HomePage() {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [pilihanArticles, setPilihanArticles] = useState<Article[]>([]);
  const [moreArticles, setMoreArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      setLoading(true);
      try {
        const [featuredRes, latestRes, categoriesRes] = await Promise.all([
          fetch('/api/articles?featured=true&limit=1'),
          fetch('/api/articles?limit=12'),
          fetch('/api/categories'),
        ]);

        const featuredData = featuredRes.ok ? await featuredRes.json() : { data: [] };
        const latestData = latestRes.ok ? await latestRes.json() : { data: [] };
        const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };

        const featured = (featuredData.data || featuredData || []).length > 0
          ? (featuredData.data || featuredData)[0]
          : (latestData.data || latestData || []).length > 0
            ? (latestData.data || latestData)[0]
            : null;

        const allLatest = latestData.data || latestData || [];
        const latest = allLatest.filter((a: Article) => a.id !== featured?.id).slice(0, 6);

        // Popular articles sorted by views
        const popular = [...(latestData.data || latestData || [])]
          .sort((a: Article, b: Article) => (b.views || 0) - (a.views || 0))
          .slice(0, 5);

        // Featured/pilihan articles (breaking or featured)
        const pilihan = allLatest
          .filter((a: Article) => a.featured || a.breaking)
          .filter((a: Article) => a.id !== featured?.id)
          .slice(0, 3);

        // More articles
        const more = allLatest.slice(7, 13);

        setFeaturedArticle(featured);
        setLatestArticles(latest);
        setPopularArticles(popular);
        setPilihanArticles(pilihan);
        setMoreArticles(more);
        setCategories(categoriesData.data || categoriesData || []);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  return (
    <>
      <BreakingNewsTicker />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        {loading ? (
          <Skeleton className="w-full h-[50vh] sm:h-[60vh] md:h-[65vh]" />
        ) : featuredArticle ? (
          <NewsHero article={featuredArticle} />
        ) : null}

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
            <NewsGrid articles={latestArticles} columns={3} />
          )}
        </section>

        <Separator className="mx-auto max-w-7xl" />

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
              {/* Ad Space Placeholder */}
              <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Iklan</p>
                <div className="mt-2 h-60 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-400">Ruang Iklan 300x250</span>
                </div>
              </div>

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
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mb-1">
                                {article.categoryName}
                              </Badge>
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

              {/* Category List */}
              {categories.length > 0 && (
                <div>
                  <SectionHeader title="Kategori" icon={null} />
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 8).map((cat) => (
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
                </div>
              )}
            </aside>
          </div>
        </section>

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

        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-red-600">{icon}</span>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
