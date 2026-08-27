'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { db, isFirebaseClientConfigured } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import type { Article, Category, Author } from '@/types';

/**
 * Generic hook for realtime Firestore collection listener
 */
function useRealtimeCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled = true
): { data: T[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseClientConfigured || !enabled || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;

    let unsubscribe: Unsubscribe;
    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Realtime error [${collectionName}]:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(`Failed to setup realtime [${collectionName}]:`, err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [collectionName, enabled, JSON.stringify(constraints.map(c => String(c)))]);

  return { data, loading, error };
}

/**
 * Realtime breaking news articles
 */
export function useRealtimeBreakingNews() {
  const { data, loading, error } = useRealtimeCollection<Article>(
    'articles',
    [
      where('breaking', '==', true),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(10),
    ],
    true
  );
  return { articles: data, loading, error };
}

/**
 * Realtime published articles (latest)
 */
export function useRealtimeArticles(articleLimit = 12) {
  const { data, loading, error } = useRealtimeCollection<Article>(
    'articles',
    [
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(articleLimit),
    ],
    true
  );
  return { articles: data, loading, error };
}

/**
 * Realtime featured articles
 */
export function useRealtimeFeaturedArticles() {
  const { data, loading, error } = useRealtimeCollection<Article>(
    'articles',
    [
      where('featured', '==', true),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(5),
    ],
    true
  );
  return { articles: data, loading, error };
}

/**
 * Realtime categories
 */
export function useRealtimeCategories() {
  const { data, loading, error } = useRealtimeCollection<Category>(
    'categories',
    [orderBy('order', 'asc')],
    true
  );
  return { categories: data, loading, error };
}

/**
 * Realtime dashboard stats - all articles for admin
 */
export function useRealtimeDashboardStats() {
  const [stats, setStats] = useState<{
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    todayArticles: number;
    totalViews: number;
    todayViews: number;
    weekViews: number;
    monthViews: number;
  } | null>(null);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseClientConfigured || !db) {
      setLoading(false);
      return;
    }

    const colRef = collection(db, 'articles');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Article[];
        const published = all.filter((a) => a.status === 'published');
        const drafts = all.filter((a) => a.status === 'draft');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayArticles = all.filter((a) => a.updatedAt && new Date(a.updatedAt) >= today);
        const totalViews = published.reduce((sum, a) => sum + (a.views || 0), 0);

        setStats({
          totalArticles: all.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          todayArticles: todayArticles.length,
          totalViews,
          todayViews: 0,
          weekViews: 0,
          monthViews: 0,
        });

        setRecentArticles(
          [...all]
            .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))
            .slice(0, 5)
        );

        setPopularArticles(
          [...published]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5)
        );

        setLoading(false);
      },
      (err) => {
        console.error('Dashboard realtime error:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { stats, recentArticles, popularArticles, loading };
}

/**
 * Realtime comments for an article
 */
export function useRealtimeComments(articleId: string) {
  const { data, loading, error } = useRealtimeCollection<any>(
    'comments',
    [
      where('articleId', '==', articleId),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(50),
    ],
    !!articleId
  );
  return { comments: data, loading, error };
}

/**
 * Realtime single article by slug (for live view count updates)
 */
export function useRealtimeArticleViewCount(articleId: string) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!isFirebaseClientConfigured || !db || !articleId) return;

    // We can't listen to a single doc field easily without client SDK rules
    // So we use a polling approach via API for views
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setViews(data.data?.views || 0);
        }
      } catch {}
    }, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [articleId]);

  return views;
}
