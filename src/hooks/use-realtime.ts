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
import { toDate } from '@/lib/utils';
import type { Article, Category, Author } from '@/types';

/** Normalize Firestore date fields to ISO strings in an object */
function normalizeDates<T>(doc: Record<string, any>): T {
  const dateFields = ['createdAt', 'updatedAt', 'publishedAt', 'deletedAt'];
  const normalized = { ...doc };
  for (const field of dateFields) {
    if (normalized[field] != null) {
      const d = toDate(normalized[field]);
      normalized[field] = d ? d.toISOString() : null;
    }
  }
  return normalized as T;
}

/**
 * Generic hook for realtime Firestore collection listener with API fallback.
 * Tries onSnapshot first for true realtime. If it fails (e.g. missing composite index),
 * falls back to fetching the REST API endpoint.
 */
function useRealtimeCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled = true,
  fallbackApiUrl?: string,
): { data: T[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const realtimeFailedRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  // API fallback fetcher
  const fetchFromApi = useCallback(async () => {
    if (!fallbackApiUrl) return;
    try {
      const res = await fetch(fallbackApiUrl);
      if (res.ok) {
        const json = await res.json();
        const items = (json.data || json || []) as T[];
        if (items.length > 0) {
          setData((prev) => {
            // Only use API data if realtime hasn't already loaded
            if (prev.length > 0 && !realtimeFailedRef.current) return prev;
            return items;
          });
        }
      }
    } catch (err) {
      console.warn(`API fallback failed [${collectionName}]:`, err);
    }
  }, [fallbackApiUrl, collectionName]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // If Firebase client not configured, go straight to API fallback
    if (!isFirebaseClientConfigured || !db) {
      setLoading(true);
      fetchFromApi().finally(() => setLoading(false));
      return;
    }

    setLoading(true);
    realtimeFailedRef.current = false;
    initialLoadDoneRef.current = false;

    const colRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;

    let unsubscribe: Unsubscribe;
    let snapshotReceived = false;

    // Set a timeout: if onSnapshot doesn't fire within 4s, try API fallback
    const fallbackTimer = setTimeout(() => {
      if (!snapshotReceived && fallbackApiUrl) {
        console.warn(`[Realtime] Timeout for ${collectionName}, trying API fallback`);
        realtimeFailedRef.current = true;
        fetchFromApi().finally(() => setLoading(false));
      } else if (!snapshotReceived) {
        // No fallback URL, just stop loading
        setLoading(false);
      }
    }, 4000);

    try {
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshotReceived = true;
          clearTimeout(fallbackTimer);
          const items = snapshot.docs.map((doc) =>
            normalizeDates<T>({ id: doc.id, ...doc.data() })
          );
          setData(items);
          setLoading(false);
          setError(null);
          initialLoadDoneRef.current = true;
        },
        (err) => {
          console.warn(`[Realtime] onSnapshot error [${collectionName}]:`, err.message);
          clearTimeout(fallbackTimer);
          realtimeFailedRef.current = true;
          setError(err.message);
          setLoading(false);
          // Try API fallback on error
          if (fallbackApiUrl) {
            fetchFromApi();
          }
        }
      );
    } catch (err) {
      console.warn(`[Realtime] Failed to setup listener [${collectionName}]:`, err);
      clearTimeout(fallbackTimer);
      realtimeFailedRef.current = true;
      setLoading(false);
      // Try API fallback
      if (fallbackApiUrl) {
        fetchFromApi();
      }
    }

    return () => {
      clearTimeout(fallbackTimer);
      if (unsubscribe) unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, enabled]);

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
    true,
    '/api/articles?breaking=true'
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
    true,
    `/api/articles?limit=${articleLimit}`
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
    true,
    '/api/articles?featured=true'
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
    true,
    '/api/categories'
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
        const all = snapshot.docs.map((d) => normalizeDates<Article>({ id: d.id, ...d.data() }));
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
    !!articleId,
    articleId ? `/api/comments?articleId=${articleId}` : undefined
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

    // Poll via API for views
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setViews(data.data?.views || 0);
        }
      } catch {}
    }, 30000);

    return () => clearInterval(interval);
  }, [articleId]);

  return views;
}
