import { NextResponse } from 'next/server';
import { isFirebaseConfigured, successResponse, errorResponse, normalizeDocDates } from '@/lib/api-helpers';

// GET /api/homepage — Single endpoint for all homepage data
// Replaces 5 separate API calls + 5 onSnapshot listeners
export async function GET() {
  try {
    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    // Run all queries in parallel — 5 targeted reads instead of 5 full collection scans
    const [breakingSnap, featuredSnap, latestSnap, categoriesSnap, adsSnap] = await Promise.all([
      // 1. Breaking news (max 10)
      adminDb
        .collection('articles')
        .where('breaking', '==', true)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(10)
        .get(),
      // 2. Featured articles (max 5)
      adminDb
        .collection('articles')
        .where('featured', '==', true)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(5)
        .get(),
      // 3. Latest articles (13 for homepage grid)
      adminDb
        .collection('articles')
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(13)
        .get(),
      // 4. Categories (ordered)
      adminDb
        .collection('categories')
        .orderBy('order', 'asc')
        .get(),
      // 5. Active ads
      adminDb
        .collection('ads')
        .orderBy('slotId', 'asc')
        .get(),
    ]);

    const breaking = breakingSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));
    const featured = featuredSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));
    const latest = latestSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));
    const categories = categoriesSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));
    const ads = adsSnap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));

    return successResponse({ breaking, featured, latest, categories, ads });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    return errorResponse('Failed to fetch homepage');
  }
}
