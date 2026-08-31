import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, getAuthUser, normalizeDocDates } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/team/:id — single member (admin)
export async function GET(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    const { _id } = await params;
    const doc = await adminDb.collection('team').doc(_id).get();
    if (!doc.exists) return errorResponse('Not found', 404);

    return successResponse(normalizeDocDates({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching team member:', error);
    return errorResponse('Failed to fetch team member');
  }
}

// PUT /api/team/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) return errorResponse('Unauthorized', 401);

    const { _id } = await params;
    const body = await request.json();
    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };

    const allowed = ['name', 'position', 'photo', 'bio', 'email', 'phone', 'facebook', 'instagram', 'twitter', 'order', 'active'];
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    await adminDb.collection('team').doc(_id).update(updates);
    const updated = await adminDb.collection('team').doc(_id).get();
    if (!updated.exists) return errorResponse('Not found', 404);

    return successResponse(normalizeDocDates({ id: updated.id, ...updated.data() }));
  } catch (error) {
    console.error('Error updating team member:', error);
    return errorResponse('Failed to update team member');
  }
}

// DELETE /api/team/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ _id: string }> }) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) return errorResponse('Unauthorized', 401);

    const { _id } = await params;

    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    await adminDb.collection('team').doc(_id).delete();
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return errorResponse('Failed to delete team member');
  }
}
