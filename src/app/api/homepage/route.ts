import { NextResponse } from 'next/server';
import { isFirebaseConfigured, successResponse, errorResponse, normalizeDocDates } from '@/lib/api-helpers';

// GET /api/homepage — Single endpoint for all homepage data
// Fetches articles once, filters in memory (no composite index needed)
export async function GET() {
  try {
    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    // 3 parallel reads: articles, categories, ads (no composite index needed)
    const [articlesSnap, categoriesSnap, adsSnap] = await Promise.all([
      adminDb.collection('articles').get(),
      adminDb.collection('categories').orderBy('order', 'asc').get(),
      adminDb.collection('ads').orderBy('slotId', 'asc').get(),
    ]);

    // Normalize all articles once
    const allArticles = articlesSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));

    // Filter & sort in memory (no index needed)
    const published = allArticles.filter((a: any) => a.status === 'published');
    published.sort((a: any, b: any) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

    const breaking = published.filter((a: any) => a.breaking === true).slice(0, 10);
    const featured = published.filter((a: any) => a.featured === true).slice(0, 5);
    const latest = published.slice(0, 13);
    const categories = categoriesSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));
    const ads = adsSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));

    return successResponse({ breaking, featured, latest, categories, ads });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    return errorResponse('Failed to fetch homepage');
  }
}
