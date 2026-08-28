import { NextRequest, NextResponse } from 'next/server';
import { handleCors, successResponse, errorResponse, getAuthUser, getUserRole, requireRole, normalizeDocDates } from '@/lib/api-helpers';
import type { AdSlot } from '@/types';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// Default 10 ad slot definitions
const DEFAULT_SLOTS = [
  { slotId: 'slot-1', title: 'Header Banner', position: 'below_header', type: 'leaderboard' as const },
  { slotId: 'slot-2', title: 'Setelah Hero', position: 'after_hero', type: 'leaderboard' as const },
  { slotId: 'slot-3', title: 'In-Feed 1', position: 'in_feed_1', type: 'inline' as const },
  { slotId: 'slot-4', title: 'Sidebar Atas', position: 'sidebar_top', type: 'sidebar' as const },
  { slotId: 'slot-5', title: 'Sidebar Tengah', position: 'sidebar_middle', type: 'sidebar' as const },
  { slotId: 'slot-6', title: 'Sidebar Bawah', position: 'sidebar_bottom', type: 'sidebar' as const },
  { slotId: 'slot-7', title: 'Tengah Halaman 1', position: 'mid_page_1', type: 'leaderboard' as const },
  { slotId: 'slot-8', title: 'Tengah Halaman 2', position: 'mid_page_2', type: 'leaderboard' as const },
  { slotId: 'slot-9', title: 'Sebelum Newsletter', position: 'pre_newsletter', type: 'leaderboard' as const },
  { slotId: 'slot-10', title: 'Footer Banner', position: 'footer_banner', type: 'banner' as const },
];

// GET /api/ads — public, returns active ads
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true'; // admin mode

    const snap = await adminDb.collection('ads').orderBy('slotId', 'asc').get();
    let ads = snap.docs.map((d) => normalizeDocDates<AdSlot>({ id: d.id, ...d.data() }));

    // If no ads exist yet, seed defaults
    if (ads.length === 0) {
      const batch = adminDb.batch();
      const now = new Date().toISOString();
      for (const slot of DEFAULT_SLOTS) {
        const docRef = adminDb.collection('ads').doc();
        batch.set(docRef, {
          ...slot,
          imageUrl: '',
          linkUrl: '',
          altText: '',
          advertiserName: '',
          active: false,
          createdAt: now,
          updatedAt: now,
        });
      }
      await batch.commit();

      // Re-fetch after seeding
      const newSnap = await adminDb.collection('ads').orderBy('slotId', 'asc').get();
      ads = newSnap.docs.map((d) => normalizeDocDates<AdSlot>({ id: d.id, ...d.data() }));
    }

    // Public mode: only return active ads with images
    if (!all) {
      ads = ads.filter((ad) => ad.active && ad.imageUrl);
    }

    return successResponse(ads);
  } catch (err) {
    console.error('[GET /api/ads]', err);
    return errorResponse('Gagal memuat iklan');
  }
}

// PUT /api/ads — admin, update an ad slot
export async function PUT(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const auth = await requireRole(request, ['super_admin', 'editor']);
    if (!auth.authorized) {
      return errorResponse('Unauthorized', 401);
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return errorResponse('ID iklan diperlukan', 400);

    // Build update payload — only allow specific fields
    const allowedFields = ['title', 'imageUrl', 'linkUrl', 'altText', 'advertiserName', 'active'];
    const payload: Record<string, any> = { updatedAt: new Date().toISOString() };
    for (const field of allowedFields) {
      if (field in updates) {
        payload[field] = updates[field];
      }
    }

    await adminDb.collection('ads').doc(id).update(payload);
    const updated = await adminDb.collection('ads').doc(id).get();
    const ad = normalizeDocDates<AdSlot>({ id: updated.id, ...updated.data() });

    return successResponse(ad);
  } catch (err) {
    console.error('[PUT /api/ads]', err);
    return errorResponse('Gagal mengupdate iklan');
  }
}

// POST /api/ads/upload — admin, upload ad image to Cloudinary
export async function POST(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const auth = await requireRole(request, ['super_admin', 'editor']);
    if (!auth.authorized) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return errorResponse('File diperlukan', 400);

    const { uploadImage } = await import('@/lib/cloudinary');
    const result = await uploadImage(file, 'meranti-report/ads');

    return successResponse({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error('[POST /api/ads/upload]', err);
    return errorResponse('Gagal mengupload gambar iklan');
  }
}
