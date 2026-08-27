import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, requireRole } from '@/lib/api-helpers';
import { DEFAULT_SETTINGS } from '@/lib/mock-data';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/settings
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    if (!isFirebaseConfigured()) {
      return successResponse(DEFAULT_SETTINGS);
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    const doc = await adminDb.collection('settings').doc('site').get();

    if (!doc.exists) {
      return successResponse(DEFAULT_SETTINGS);
    }

    return successResponse(doc.data());
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse('Failed to fetch settings');
  }
}

// PUT /api/settings
export async function PUT(request: NextRequest) {
  try {
    const { authorized, role } = await requireRole(request, ['super_admin']);
    if (!authorized && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super admin only.' }, { status: 403 });
    }

    const body = await request.json();

    if (!isFirebaseConfigured()) {
      return successResponse(body);
    }

    const { adminDb } = await import('@/lib/firebase/admin');

    await adminDb.collection('settings').doc('site').set(
      {
        ...body,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return successResponse(body);
  } catch (error) {
    console.error('Error updating settings:', error);
    return errorResponse('Failed to update settings');
  }
}
