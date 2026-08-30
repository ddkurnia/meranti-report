import { NextRequest, NextResponse } from 'next/server';
import { handleCors, successResponse, errorResponse } from '@/lib/api-helpers';
import { DEFAULT_CATEGORIES } from '@/lib/mock-data';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// POST /api/sync-categories — Replace all categories with DEFAULT_CATEGORIES
// Requires seedKey header or body for security (one-time migration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const seedKey = body.seedKey || request.headers.get('x-seed-key');
    if (seedKey !== 'meranti-sync-2025') {
      return errorResponse('Unauthorized. Provide seedKey.', 401);
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    const now = new Date().toISOString();
    const batch = adminDb.batch();

    // 1. Delete all existing categories
    const existingSnap = await adminDb.collection('categories').get();
    for (const doc of existingSnap.docs) {
      batch.delete(doc.ref);
    }

    // 2. Write new categories
    for (const cat of DEFAULT_CATEGORIES) {
      const docRef = adminDb.collection('categories').doc(cat.id);
      batch.set(docRef, {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        parentId: cat.parentId || null,
        order: cat.order,
        articleCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();

    return successResponse({
      message: 'Categories synced successfully',
      deleted: existingSnap.size,
      created: DEFAULT_CATEGORIES.length,
      categories: DEFAULT_CATEGORIES.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    });
  } catch (error) {
    console.error('Error syncing categories:', error);
    return errorResponse('Failed to sync categories');
  }
}
