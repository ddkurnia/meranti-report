'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreadcrumbNav } from '@/components/news/breadcrumb-nav';
import { NewsGrid } from '@/components/news/news-grid';
import { NewsletterSection } from '@/components/news/newsletter-section';
import type { Article } from '@/types';

const PAGE_SIZE = 12;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!query);

  // Update title
  useEffect(() => {
    if (query) {
      document.title = `Hasil pencarian '${query}' - Meranti Report`;
    }
  }, [query]);

  const doSearch = useCallback(
    async (q: string, p: number) => {
      if (!q.trim()) {
        setResults([]);
        setTotal(0);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      try {
        const res = await fetch(
          `/api/articles?q=${encodeURIComponent(q.trim())}&page=${p}&limit=${PAGE_SIZE}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || data || []);
          const pagination = data.pagination;
          if (pagination) {
            setTotalPages(pagination.totalPages || 1);
            setTotal(pagination.total || 0);
          } else {
            const arr = data.data || data || [];
            setTotal(arr.length);
          }
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setSearchInput(query);
    setPage(1);
    doSearch(query, 1);
  }, [query, doSearch]);

  useEffect(() => {
    if (query) {
      doSearch(query, page);
    }
  }, [page, query, doSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      setPage(1);
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <BreadcrumbNav
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Pencarian' },
            ]}
          />

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari berita..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl"
              />
            </div>
          </form>

          {/* No query prompt */}
          {!searched && !loading && (
            <div className="text-center py-20">
              <Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold">Cari Berita</h2>
              <p className="text-muted-foreground mt-2">
                Ketik kata kunci untuk menemukan berita yang Anda cari.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
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
          )}

          {/* Results */}
          {!loading && searched && results.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Menampilkan <span className="font-semibold text-foreground">{total}</span> hasil untuk{' '}
                <Badge variant="secondary" className="font-normal">&quot;{query}&quot;</Badge>
              </p>
              <NewsGrid articles={results} columns={3} />

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

          {/* Empty state */}
          {!loading && searched && results.length === 0 && (
            <div className="text-center py-20">
              <SearchX className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-semibold">Tidak ada hasil</h2>
              <p className="text-muted-foreground mt-2">
                Tidak ada hasil untuk &quot;<span className="font-medium">{query}</span>&quot;. Coba gunakan kata kunci lain.
              </p>
            </div>
          )}
        </div>

        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}
