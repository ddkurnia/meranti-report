import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, getAuthUser, generateSlug } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/categories
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
    const snap = await adminDb.collection('categories').orderBy('order', 'asc').get();
    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return successResponse(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return errorResponse('Failed to fetch categories: ' + msg);
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, parentId, order } = body;

    if (!name) return errorResponse('Name is required', 400);

    const categorySlug = slug || generateSlug(name);

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    const categoryData = {
      name,
      slug: categorySlug,
      description: description || null,
      parentId: parentId || null,
      order: order || 0,
      articleCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('categories').add(categoryData);
    return NextResponse.json({ success: true, data: { id: docRef.id, ...categoryData } }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return errorResponse('Failed to create category');
  }
}
