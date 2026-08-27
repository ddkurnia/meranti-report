import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers';
import { DEFAULT_CATEGORIES, DEMO_ARTICLES, DEMO_AUTHORS, DEFAULT_SETTINGS, DEMO_COMMENTS } from '@/lib/mock-data';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// POST /api/seed - Seed the database with demo data
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return errorResponse('Seeding is only allowed in development', 403);
    }

    // Require auth or API key
    const authHeader = request.headers.get('Authorization');
    const apiKey = request.headers.get('x-api-key');
    const uid = await getAuthUser(request);

    if (!uid && !apiKey && !authHeader) {
      // Check for a simple seed key in body
      const body = await request.json().catch(() => ({}));
      if (body.seedKey !== 'meranti-seed-2025') {
        return errorResponse('Unauthorized. Provide auth token, API key, or seedKey.', 401);
      }
    }

    // If Firebase is not configured, just return success
    if (!isFirebaseConfigured()) {
      return successResponse({
        message: 'Demo mode active - mock data is served directly from mock-data.ts',
        seeded: {
          categories: DEFAULT_CATEGORIES.length,
          articles: DEMO_ARTICLES.length,
          authors: DEMO_AUTHORS.length,
          comments: DEMO_COMMENTS.length,
          settings: 1,
        },
      });
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    const batch = adminDb.batch();

    const now = new Date().toISOString();

    // Seed categories
    for (const cat of DEFAULT_CATEGORIES) {
      const docRef = adminDb.collection('categories').doc(cat.id);
      batch.set(docRef, {
        ...cat,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Seed authors
    for (const author of DEMO_AUTHORS) {
      const docRef = adminDb.collection('authors').doc(author.id);
      batch.set(docRef, {
        ...author,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Seed articles
    for (const article of DEMO_ARTICLES) {
      const docRef = adminDb.collection('articles').doc(article.id);
      batch.set(docRef, {
        ...article,
        createdAt: now,
        updatedAt: now,
        publishedAt: article.publishedAt ? now : null,
      });
    }

    // Seed comments
    for (const comment of DEMO_COMMENTS) {
      const docRef = adminDb.collection('comments').doc(comment.id);
      batch.set(docRef, {
        ...comment,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Seed settings
    const settingsRef = adminDb.collection('settings').doc('site');
    batch.set(settingsRef, {
      ...DEFAULT_SETTINGS,
      updatedAt: now,
    });

    await batch.commit();

    return successResponse({
      message: 'Database seeded successfully with demo data',
      seeded: {
        categories: DEFAULT_CATEGORIES.length,
        articles: DEMO_ARTICLES.length,
        authors: DEMO_AUTHORS.length,
        comments: DEMO_COMMENTS.length,
        settings: 1,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return errorResponse('Failed to seed database');
  }
}
