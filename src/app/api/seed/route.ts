import { NextRequest, NextResponse } from 'next/server';
import { handleCors, successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers';
import { DEFAULT_CATEGORIES, DEMO_ARTICLES, DEMO_AUTHORS, DEFAULT_SETTINGS, DEMO_COMMENTS } from '@/lib/mock-data';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// POST /api/seed - Seed the database with demo data
export async function POST(request: NextRequest) {
  try {
    // Require seed key or auth
    const body = await request.json().catch(() => ({}));
    const seedKey = body.seedKey || request.headers.get('x-seed-key');
    const uid = await getAuthUser(request);

    if (!uid && seedKey !== 'meranti-seed-2025') {
      return errorResponse('Unauthorized. Provide auth token or seedKey.', 401);
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
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
      const articleData: Record<string, unknown> = {
        ...article,
        createdAt: now,
        updatedAt: now,
        publishedAt: article.status === 'published' ? now : null,
      };
      // Ensure dates are ISO strings, not Date objects
      if (articleData.publishedAt instanceof Date) {
        articleData.publishedAt = articleData.publishedAt.toISOString();
      }
      batch.set(docRef, articleData);
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
