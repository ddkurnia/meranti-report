import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, successResponse, errorResponse } from '@/lib/api-helpers';

// POST /api/views — Increment article view counter (client-side dedup via sessionStorage)
// Optimized: 1 read + 1 write total (no views collection, no dedup query)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, sessionId } = body;

    if (!articleId) return errorResponse('articleId is required', 400);
    if (!sessionId) return errorResponse('sessionId is required', 400);

    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    // Single read + write: just increment the counter
    // Client already deduplicates via sessionStorage (1-hour check)
    const articleDoc = await adminDb.collection('articles').doc(articleId).get();
    if (!articleDoc.exists) return errorResponse('Article not found', 404);

    const currentViews = (articleDoc.data()?.views || 0) as number;
    await adminDb.collection('articles').doc(articleId).update({
      views: currentViews + 1,
    });

    return successResponse({ recorded: true, views: currentViews + 1 });
  } catch (error) {
    console.error('Error recording view:', error);
    return errorResponse('Failed to record view');
  }
}
