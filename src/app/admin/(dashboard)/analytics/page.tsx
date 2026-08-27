'use client';

import { useEffect, useState } from 'react';
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
import { Eye, TrendingUp, Calendar } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import type { AnalyticsData, PopularArticle, PopularCategory, DashboardStats } from '@/types';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyViews, setDailyViews] = useState<AnalyticsData[]>([]);
  const [topArticles, setTopArticles] = useState<PopularArticle[]>([]);
  const [topCategories, setTopCategories] = useState<PopularCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || null);
          setDailyViews(data.dailyViews || []);
          setTopArticles(data.topArticles || []);
          setTopCategories(data.topCategories || []);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const maxViews = dailyViews.length > 0
    ? Math.max(...dailyViews.map((d) => d.views))
    : 1;

  const statCards = [
    {
      label: 'Views Hari Ini',
      value: stats?.todayViews ?? 0,
      icon: Eye,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Views 7 Hari',
      value: stats?.weekViews ?? 0,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Views 30 Hari',
      value: stats?.monthViews ?? 0,
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analitik</h2>
        <p className="text-muted-foreground">Statistik dan analitik portal berita.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
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

      {/* Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Views 7 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : dailyViews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada data views.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end gap-2 h-[200px]">
                {dailyViews.map((day) => {
                  const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                  const dateStr = new Date(day.date).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                  });
                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center flex-1 gap-1"
                    >
                      <span className="text-xs font-medium">{formatNumber(day.views)}</span>
                      <div
                        className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
                        style={{ height: `${Math.max(height, 4)}%` }}
                        title={`${dateStr}: ${day.views} views`}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {dateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Berita</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada data.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topArticles.map((article, idx) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {idx + 1}
                          </span>
                          <span className="font-medium truncate max-w-[200px] block">
                            {article.title}
                          </span>
                        </div>
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

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 5 Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada data.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah Artikel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCategories.map((cat) => (
                    <TableRow key={cat.slug}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-right font-medium">{cat.count}</TableCell>
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
