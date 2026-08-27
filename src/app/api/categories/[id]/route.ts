import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, getAuthUser, generateSlug } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { id } = await params;

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
    const doc = await adminDb.collection('categories').doc(id).get();
    if (!doc.exists) return errorResponse('Category not found', 404);

    return successResponse({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching category:', error);
    return errorResponse('Failed to fetch category');
  }
}

// PUT /api/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    const doc = await adminDb.collection('categories').doc(id).get();
    if (!doc.exists) return errorResponse('Category not found', 404);

    const updateData: Record<string, unknown> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    if (body.name) updateData.slug = body.slug || generateSlug(body.name);

    await adminDb.collection('categories').doc(id).update(updateData);
    const updatedDoc = await adminDb.collection('categories').doc(id).get();

    return successResponse({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating category:', error);
    return errorResponse('Failed to update category');
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
    await adminDb.collection('categories').doc(id).delete();
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return errorResponse('Failed to delete category');
  }
}
