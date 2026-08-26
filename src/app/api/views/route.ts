import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, handleCors, successResponse, errorResponse } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/views?articleId=xxx
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) return errorResponse('articleId is required', 400);

    if (!isFirebaseAdminConfigured()) {
      // Return a random view count for demo
      const count = Math.floor(Math.random() * 5000) + 100;
      return successResponse({ articleId, views: count });
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    const snap = await adminDb
      .collection('views')
      .where('articleId', '==', articleId)
      .count()
      .get();

    return successResponse({ articleId, views: snap.data().count });
  } catch (error) {
    console.error('Error fetching views:', error);
    return errorResponse('Failed to fetch views');
  }
}

// POST /api/views - Record a view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, sessionId } = body;

    if (!articleId) return errorResponse('articleId is required', 400);
    if (!sessionId) return errorResponse('sessionId is required', 400);

    if (!isFirebaseAdminConfigured()) {
      return successResponse({ recorded: true });
    }

    const { adminDb } = await import('@/lib/firebase/admin');

    // Deduplication: check if same sessionId viewed same article within 1 hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const existingView = await adminDb
      .collection('views')
      .where('articleId', '==', articleId)
      .where('sessionId', '==', sessionId)
      .get();

    // Check if any recent view exists (within 1 hour)
    let shouldRecord = true;
    existingView.docs.forEach((doc) => {
      const createdAt = doc.data().createdAt?.toDate?.() || doc.data().createdAt;
      if (createdAt && new Date(createdAt) > oneHourAgo) {
        shouldRecord = false;
      }
    });

    if (!shouldRecord) {
      return successResponse({ recorded: false, reason: 'Already viewed recently' });
    }

    // Record the view
    const { FieldValue } = await import('firebase-admin/firestore');
    await adminDb.collection('views').add({
      articleId,
      sessionId,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Also increment the view count on the article
    await adminDb.collection('articles').doc(articleId).update({
      views: FieldValue.increment(1),
    });

    return successResponse({ recorded: true });
  } catch (error) {
    console.error('Error recording view:', error);
    return errorResponse('Failed to record view');
  }
}
