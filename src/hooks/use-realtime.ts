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
import type { Article, Category, Author, AdSlot } from '@/types';

// ============================================================
// PUBLIC-FACING HOOKS (no onSnapshot — uses API fetch + cache)
// Saves ~500 reads per homepage load vs realtime hooks
// ============================================================

const CACHE_TTL = 120_000; // 2 minutes
const cache = new Map<string, { data: any; ts: number }>();

function fetchCached<T>(key: string, url: string): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.ts < CACHE_TTL) return Promise.resolve(cached.data as T);
  return fetch(url)
    .then((r) => r.json())
    .then((json) => {
      const data = json.data ?? json;
      cache.set(key, { data, ts: now });
      return data as T;
    });
}

/** Homepage: 1 API call replaces 5 realtime listeners */
export function useHomepageData() {
  const [data, setData] = useState<{
    breaking: Article[];
    featured: Article[];
    latest: Article[];
    categories: Category[];
    ads: AdSlot[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCached<{ breaking: Article[]; featured: Article[]; latest: Article[]; categories: Category[]; ads: AdSlot[] }>('homepage', '/api/homepage')
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const ads = (data?.ads || []).filter((ad) => ad.active && ad.imageUrl);
  return { ...data, ads, loading };
}

/** Single article by slug — no full collection scan */
export function useArticleBySlug(slug: string) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    fetch(`/api/articles/slug/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { setArticle(json?.data || null); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  return { article, loading };
}

/** Categories — simple fetch with cache, no realtime for public */
export function useCachedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCached<Category[]>('categories', '/api/categories')
      .then((d) => { setCategories(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { categories, loading };
}

/** Breaking news — simple fetch with cache */
export function useCachedBreakingNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCached<Article[]>('breaking', '/api/articles?breaking=true')
      .then((d) => { setArticles(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { articles, loading };
}

// ============================================================
// ADMIN-ONLY HOOKS (keeps realtime via onSnapshot)
// ============================================================

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
 * Fetch data from API endpoint.
 * Returns normalized array of items.
 */
async function fetchApi<T>(apiUrl: string): Promise<T[]> {
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  return (json.data || json || []) as T[];
}

/**
 * Generic hook: API-first with realtime upgrade.
 *
 * Strategy:
 * 1. Fetch from API immediately (reliable, no composite index needed)
 * 2. In parallel, attempt onSnapshot for realtime updates
 * 3. If onSnapshot succeeds, it takes over for live data
 * 4. If onSnapshot fails (missing index etc.), API data stays active
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let unsubscribe: Unsubscribe | undefined;
    let apiDataReceived = false;
    let snapshotReceived = false;

    // ---- STEP 1: Fetch from API immediately ----
    if (fallbackApiUrl) {
      fetchApi<T>(fallbackApiUrl)
        .then((items) => {
          if (!mountedRef.current) return;
          apiDataReceived = true;
          if (!snapshotReceived) {
            setData(items);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.warn(`[Realtime] API fetch failed [${collectionName}]:`, err.message);
          // If API also fails and no snapshot yet, stop loading
          if (!snapshotReceived) {
            setLoading(false);
            setError(err.message);
          }
        });
    } else {
      // No API URL — must rely on onSnapshot or nothing
      setLoading(false);
    }

    // ---- STEP 2: Try onSnapshot for realtime ----
    if (isFirebaseClientConfigured && db) {
      const colRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;

      try {
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!mountedRef.current) return;
            snapshotReceived = true;
            const items = snapshot.docs.map((doc) =>
              normalizeDates<T>({ id: doc.id, ...doc.data() })
            );
            setData(items);
            setLoading(false);
            setError(null);
          },
          (err) => {
            // onSnapshot failed (likely missing composite index)
            // That's OK — API data is already showing if it succeeded
            console.warn(`[Realtime] onSnapshot error [${collectionName}]:`, err.message);
            // Only set error if neither API nor snapshot has data
            if (!apiDataReceived && !snapshotReceived) {
              setError(err.message);
              setLoading(false);
            }
          }
        );
      } catch (err) {
        console.warn(`[Realtime] Failed to setup listener [${collectionName}]:`, err);
      }
    }

    return () => {
      mountedRef.current = false;
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

/**
 * Realtime ad slots — public (only active ads with images)
 */
export function useRealtimeAds() {
  const { data, loading, error } = useRealtimeCollection<AdSlot>(
    'ads',
    [orderBy('slotId', 'asc')],
    true,
    '/api/ads'
  );
  // Filter: only active ads with imageUrl on client side too
  const activeAds = data.filter((ad) => ad.active && ad.imageUrl);
  return { ads: activeAds, allAds: data, loading, error };
}

/**
 * Realtime all ad slots — admin (including inactive)
 */
export function useRealtimeAllAds() {
  const { data, loading, error } = useRealtimeCollection<AdSlot>(
    'ads',
    [orderBy('slotId', 'asc')],
    true,
    '/api/ads?all=true'
  );
  return { ads: data, loading, error };
}
