'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Newspaper, FileEdit, Eye, TrendingUp, ArrowRight } from 'lucide-react';
import { formatNumber, formatDateShort } from '@/lib/utils';
import type { DashboardStats, Article, PopularArticle } from '@/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<PopularArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/articles?dashboard=true');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || null);
          setRecentArticles(data.recentArticles || []);
          setPopularArticles(data.popularArticles || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Berita',
      value: stats?.totalArticles ?? 0,
      icon: Newspaper,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Published',
      value: stats?.publishedArticles ?? 0,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Draft',
      value: stats?.draftArticles ?? 0,
      icon: FileEdit,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Total Views',
      value: stats?.totalViews ?? 0,
      icon: Eye,
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas portal berita.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => (
              <Card key={card.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                      <p className="text-2xl font-bold mt-1">{formatNumber(card.value)}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Berita Terbaru</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/berita">
                Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada berita.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        <Link
                          href={`/admin/berita/edit?id=${article.id}`}
                          className="hover:underline"
                        >
                          {article.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            article.status === 'published'
                              ? 'default'
                              : article.status === 'draft'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {article.status === 'published'
                            ? 'Published'
                            : article.status === 'draft'
                              ? 'Draft'
                              : 'Archived'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateShort(article.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Popular Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Berita Populer</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/analytics">
                Lihat Detail <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : popularArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada data.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="text-center">Kategori</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {article.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{article.categoryName}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(article.views)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
