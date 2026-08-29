'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { BreakingNewsTicker } from '@/components/layout/breaking-news-ticker';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreadcrumbNav } from '@/components/news/breadcrumb-nav';
import { ShareButtons } from '@/components/news/share-buttons';
import { ViewCounter } from '@/components/news/view-counter';
import { RelatedNews } from '@/components/news/related-news';
import { NewsletterSection } from '@/components/news/newsletter-section';
import { formatDate, getReadingTime } from '@/lib/utils';
import type { Article } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Update document title
  useEffect(() => {
    if (article) {
      document.title = `${article.seoTitle || article.title} - Meranti Report`;
    }
  }, [article]);

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    try {
      // Single targeted query by slug — not full collection scan
      const res = await fetch(`/api/articles/slug/${slug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setArticle(json.data);
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Record view with sessionId for deduplication
  useEffect(() => {
    if (article) {
      let sessionId = sessionStorage.getItem('mr-session');
      if (!sessionId) {
        sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem('mr-session', sessionId);
      }
      fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id, sessionId }),
      }).catch(() => {});
    }
  }, [article]);

  // Meta tags, OG image, and JSON-LD are now handled by layout.tsx (server-side)
  // for proper social media sharing and SEO.

  if (loading) {
    return <ArticleLoadingSkeleton />;
  }

  if (notFound || !article) {
    return (
      <>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
          <h2 className="text-xl font-semibold mt-4">Berita Tidak Ditemukan</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Maaf, berita yang Anda cari tidak ditemukan atau mungkin telah dihapus.
          </p>
          <Link href="/">
            <Button className="mt-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
    );
  }

  const readingTime = getReadingTime(article.content);
  const articleUrl = `${SITE_URL}/berita/${article.slug}`;

  return (
    <>
      <BreakingNewsTicker />
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <BreadcrumbNav
            items={[
              { label: 'Beranda', href: '/' },
              { label: article.categoryName, href: `/kategori/${article.categorySlug}` },
              { label: article.title },
            ]}
          />
        </div>

        {/* Article Content */}
        <article className="mx-auto max-w-3xl px-4 pb-12">
          {/* Category Badge */}
          <Link href={`/kategori/${article.categorySlug}`}>
            <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs mb-3">
              {article.categoryName}
            </Badge>
          </Link>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Subheading */}
          {article.subheading && (
            <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
              {article.subheading}
            </p>
          )}

          {/* Author, Date, Reading Time */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9">
                <AvatarImage src={article.authorPhoto} alt={article.authorName} />
                <AvatarFallback className="text-xs">
                  {article.authorName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-sm">{article.authorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{readingTime} menit baca</span>
            </div>
            <ViewCounter articleId={article.id} initialViews={article.views} />
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <figure className="mt-6">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full rounded-xl"
              />
              {article.imageCaption && (
                <figcaption className="text-center text-sm text-muted-foreground mt-2">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Body */}
          <div
            className="prose mt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-3">Bagikan:</p>
            <ShareButtons url={articleUrl} title={article.title} />
          </div>

          <Separator className="my-10" />

          {/* Related News */}
          <RelatedNews
            currentArticleId={article.id}
            categoryId={article.categoryId}
            tags={article.tags}
          />
        </article>

        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}

function ArticleLoadingSkeleton() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>

          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-4/5 mb-3" />
          <Skeleton className="h-5 w-full max-w-2xl" />

          <div className="flex items-center gap-4 mt-6">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          <Skeleton className="mt-6 w-full aspect-[16/9] rounded-xl" />

          <div className="mt-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </main>
    </>
  );
}
