import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, requireRole } from '@/lib/api-helpers';

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
    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
    const doc = await adminDb.collection('settings').doc('site').get();

    if (!doc.exists) {
      return successResponse({
        general: {
          siteName: 'Meranti Report',
          tagline: 'Kabar Meranti, Dari Kita Untuk Kita',
          description: 'Portal berita lokal terpercaya di Kepulauan Meranti. Menyajikan informasi terkini, akurat, dan terpercaya.',
          email: 'redaksi@merantireport.com',
          phone: '+62 812-3456-7890',
          address: 'Jl. Merdeka No. 1, Selat Panjang, Kepulauan Meranti, Riau',
          logo: '',
          favicon: '',
        },
        appearance: {
          primaryColor: '#1a2332',
          accentColor: '#dc2626',
          darkMode: false,
          layout: 'default',
        },
        homepage: {
          latestNewsCount: 10,
          popularNewsCount: 5,
          showBreakingNews: true,
          showGallery: false,
          showVideo: false,
          showNewsletter: true,
        },
        socialMedia: {
          facebook: '',
          instagram: '',
          tiktok: '',
          youtube: '',
          whatsapp: '',
          twitter: '',
        },
        seo: {
          defaultTitle: 'Meranti Report - Kabar Meranti, Dari Kita Untuk Kita',
          metaDescription: 'Portal berita lokal terpercaya di Kepulauan Meranti. Menyajikan informasi terkini, akurat, dan terpercaya.',
          ogImage: '',
          googleVerification: '',
          robotsConfig: '',
        },
        advertisement: {
          headerAd: { enabled: false },
          homepageAd: { enabled: false },
          articleAd: { enabled: false },
          sidebarAd: { enabled: false },
        },
        comments: {
          enabled: true,
          requireApproval: false,
        },
      });
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

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

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
