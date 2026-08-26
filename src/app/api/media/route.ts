import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, handleCors, successResponse, errorResponse, paginatedResponse, parsePagination } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/media
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);

    if (!isFirebaseAdminConfigured()) {
      return paginatedResponse([], page, limit, 0);
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    const snap = await adminDb
      .collection('media')
      .orderBy('createdAt', 'desc')
      .get();

    const media = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const total = media.length;
    const start = (page - 1) * limit;
    const paginated = media.slice(start, start + limit);

    return paginatedResponse(paginated, page, limit, total);
  } catch (error) {
    console.error('Error fetching media:', error);
    return errorResponse('Failed to fetch media');
  }
}
