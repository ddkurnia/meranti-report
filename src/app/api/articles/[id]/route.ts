import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, handleCors, successResponse, errorResponse, getAuthUser, generateSlug, requireRole } from '@/lib/api-helpers';
import { DEMO_ARTICLES } from '@/lib/mock-data';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/articles/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { id } = await params;

    // DEMO MODE
    if (!isFirebaseAdminConfigured()) {
      const article = DEMO_ARTICLES.find((a) => a.id === id);
      if (!article) return errorResponse('Article not found', 404);

      // Increment views in demo mode (just return the article, we can't persist)
      const updatedArticle = { ...article, views: article.views + 1 };
      return successResponse(updatedArticle);
    }

    // FIREBASE MODE
    const { adminDb } = await import('@/lib/firebase/admin');
    const { FieldValue } = await import('firebase-admin/firestore');

    const doc = await adminDb.collection('articles').doc(id).get();
    if (!doc.exists) return errorResponse('Article not found', 404);

    const articleData = { id: doc.id, ...(doc.data() as any) };

    // For public: only return if published
    if (articleData.status !== 'published') {
      const uid = await getAuthUser(request);
      if (!uid) return errorResponse('Article not found', 404);
    }

    // Increment views
    await adminDb.collection('articles').doc(id).update({
      views: FieldValue.increment(1),
    });

    return successResponse({ ...articleData, views: (articleData.views || 0) + 1 });
  } catch (error) {
    console.error('Error fetching article:', error);
    return errorResponse('Failed to fetch article');
  }
}

// PUT /api/articles/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseAdminConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // DEMO MODE
    if (!isFirebaseAdminConfigured()) {
      const articleIndex = DEMO_ARTICLES.findIndex((a) => a.id === id);
      if (articleIndex === -1) return errorResponse('Article not found', 404);

      const existing = DEMO_ARTICLES[articleIndex];
      const wasPublished = existing.status === 'published';
      const isNowPublished = body.status === 'published';

      const updated = {
        ...existing,
        ...body,
        slug: body.slug || (body.title ? generateSlug(body.title) : existing.slug),
        updatedAt: new Date(),
        publishedAt: (!wasPublished && isNowPublished) ? new Date() : existing.publishedAt,
      };

      DEMO_ARTICLES[articleIndex] = updated;
      return successResponse(updated);
    }

    // FIREBASE MODE
    const { adminDb } = await import('@/lib/firebase/admin');
    const { FieldValue } = await import('firebase-admin/firestore');

    const doc = await adminDb.collection('articles').doc(id).get();
    if (!doc.exists) return errorResponse('Article not found', 404);

    const existing = doc.data() as any;
    const wasPublished = existing.status === 'published';
    const isNowPublished = body.status === 'published';

    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.title) updateData.slug = body.slug || generateSlug(body.title);
    if (!wasPublished && isNowPublished) {
      updateData.publishedAt = FieldValue.serverTimestamp();
    }

    await adminDb.collection('articles').doc(id).update(updateData);
    const updatedDoc = await adminDb.collection('articles').doc(id).get();

    return successResponse({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating article:', error);
    return errorResponse('Failed to update article');
  }
}

// DELETE /api/articles/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await requireRole(request, ['super_admin', 'editor']);
    if (!authorized && isFirebaseAdminConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // DEMO MODE
    if (!isFirebaseAdminConfigured()) {
      const index = DEMO_ARTICLES.findIndex((a) => a.id === id);
      if (index === -1) return errorResponse('Article not found', 404);
      DEMO_ARTICLES.splice(index, 1);
      return successResponse({ deleted: true });
    }

    // FIREBASE MODE
    const { adminDb } = await import('@/lib/firebase/admin');
    await adminDb.collection('articles').doc(id).delete();
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return errorResponse('Failed to delete article');
  }
}
