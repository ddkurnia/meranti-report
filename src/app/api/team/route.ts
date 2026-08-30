import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, getAuthUser, normalizeDocDates } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/team — public, returns active members ordered by `order`
export async function GET() {
  const cors = handleCors(new NextRequest('https://x.com'));
  try {
    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    const snap = await adminDb
      .collection('team')
      .where('active', '==', true)
      .orderBy('order', 'asc')
      .get();

    const members = snap.docs.map((d) => normalizeDocDates({ id: d.id, ...d.data() }));
    return successResponse(members);
  } catch (error) {
    console.error('Error fetching team:', error);
    return errorResponse('Failed to fetch team');
  }
}

// POST /api/team — admin only
export async function POST(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, position, photo, bio, email, phone, facebook, instagram, twitter, order, active } = body;

    if (!name || !position) return errorResponse('Nama dan jabatan wajib diisi', 400);

    if (!isFirebaseConfigured()) return errorResponse('Not configured', 503);
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Not configured', 503);

    // Get next order number if not specified
    let nextOrder = order || 0;
    if (!order) {
      const allSnap = await adminDb.collection('team').orderBy('order', 'desc').limit(1).get();
      if (!allSnap.empty) {
        nextOrder = (allSnap.docs[0].data().order || 0) + 1;
      }
    }

    const now = new Date().toISOString();
    const data = {
      name,
      position,
      photo: photo || null,
      bio: bio || null,
      email: email || null,
      phone: phone || null,
      facebook: facebook || null,
      instagram: instagram || null,
      twitter: twitter || null,
      order: nextOrder,
      active: active !== false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection('team').add(data);
    return successResponse({ id: docRef.id, ...data }, 201);
  } catch (error) {
    console.error('Error creating team member:', error);
    return errorResponse('Failed to create team member');
  }
}
