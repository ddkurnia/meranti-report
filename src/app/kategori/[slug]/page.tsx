'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import { BreakingNewsTicker } from '@/components/layout/breaking-news-ticker';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreadcrumbNav } from '@/components/news/breadcrumb-nav';
import { NewsGrid } from '@/components/news/news-grid';
import { NewsletterSection } from '@/components/news/newsletter-section';
import { useRealtimeCategories, useRealtimeArticles } from '@/hooks/use-realtime';
import type { Article, Category } from '@/types';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { categories, loading: catLoading } = useRealtimeCategories();
  const { articles: allArticles, loading: articlesLoading } = useRealtimeArticles(100);
  const [page, setPage] = useState(1);

  // Find category from realtime data
  const category = useMemo(
    () => categories.find((c) => c.slug === slug) || null,
    [categories, slug]
  );

  // Filter articles for this category
  const categoryArticles = useMemo(
    () => allArticles.filter((a) => a.categorySlug === slug || a.categoryId === category?.id),
    [allArticles, slug, category?.id]
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(categoryArticles.length / PAGE_SIZE));
  const paginatedArticles = categoryArticles.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const loading = catLoading || articlesLoading;

  // Update title
  useEffect(() => {
    if (category) {
      document.title = `${category.name} - Meranti Report`;
    }
  }, [category]);

  // Reset page when slug changes
  useEffect(() => {
    setPage(1);
  }, [slug]);

  // Related categories (siblings)
  const relatedCategories = useMemo(
    () => categories.filter((c) => c.id !== category?.id).slice(0, 6),
    [categories, category?.id]
  );

  if (loading) {
    return (
      <>
        <BreakingNewsTicker />
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-80 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[16/10] w-full rounded-xl" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
          <h2 className="text-xl font-semibold mt-4">Kategori Tidak Ditemukan</h2>
          <p className="text-muted-foreground mt-2">Kategori yang Anda cari tidak tersedia.</p>
          <Link href="/">
            <Button className="mt-6 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
      </>
    );
  }

  return (
    <>
      <BreakingNewsTicker />
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <BreadcrumbNav
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Kategori', href: '/kategori' },
              { label: category.name },
            ]}
          />

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{category.name}</h1>
                {category.description && (
                  <p className="mt-2 text-muted-foreground max-w-2xl">{category.description}</p>
                )}
              </div>
              <Badge variant="secondary" className="font-mono text-sm w-fit">
                {category.articleCount || categoryArticles.length} artikel
              </Badge>
            </div>
          </div>

          {categoryArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Newspaper className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">Belum ada berita</p>
              <p className="text-sm mt-1">Belum ada berita di kategori ini. Silakan cek kembali nanti.</p>
            </div>
          ) : (
            <>
              <NewsGrid articles={paginatedArticles} columns={3} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - page) <= 1) return true;
                        return false;
                      })
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <span key={p} className="flex items-center gap-1">
                            {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                            <Button
                              variant={p === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPage(p)}
                              className="w-9 h-9 p-0"
                            >
                              {p}
                            </Button>
                          </span>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-1"
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Related Categories */}
          {relatedCategories.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold mb-4">Kategori Lainnya</h3>
              <div className="flex flex-wrap gap-2">
                {relatedCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    {cat.name}
                    <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                      {cat.articleCount || 0}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}
