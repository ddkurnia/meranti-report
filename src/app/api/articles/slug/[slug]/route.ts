import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, normalizeDocDates } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/articles/slug/[slug] - Fetch single published article by slug (for SSR/OG tags)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { slug } = await params;

    if (!slug) return errorResponse('Slug is required', 400);
    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    // Query by slug field
    const snap = await adminDb
      .collection('articles')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snap.empty) return errorResponse('Article not found', 404);

    const doc = snap.docs[0];
    return successResponse(normalizeDocDates({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return errorResponse('Failed to fetch article');
  }
}
