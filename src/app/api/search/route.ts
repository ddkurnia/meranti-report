import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, paginatedResponse, errorResponse, parsePagination } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/search?q=xxx&page=1&limit=10
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const { page, limit } = parsePagination(searchParams);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    if (!query) return errorResponse('Search query is required', 400);

    const q = query.toLowerCase();

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    // FIREBASE MODE
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    // Since Firestore doesn't support full-text search, we fetch all published articles
    // and filter client-side. For production, consider Algolia or Elasticsearch.
    const snap = await adminDb
      .collection('articles')
      .where('status', '==', 'published')
      .orderBy('publishedAt', 'desc')
      .limit(200)
      .get();

    let articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Text search
    articles = articles.filter((a: Record<string, unknown>) => {
      const title = (a.title as string || '').toLowerCase();
      const excerpt = (a.excerpt as string || '').toLowerCase();
      const content = (a.content as string || '').toLowerCase();
      const tags = (a.tags as string[] || []).join(' ').toLowerCase();
      return title.includes(q) || excerpt.includes(q) || content.includes(q) || tags.includes(q);
    });

    // Filter by category
    if (category) {
      articles = articles.filter((a: Record<string, unknown>) =>
        a.categorySlug === category || a.categoryId === category
      );
    }

    // Filter by tag
    if (tag) {
      const tagLower = tag.toLowerCase();
      articles = articles.filter((a: Record<string, unknown>) => {
        const tags = a.tags as string[] || [];
        return tags.some((t: string) => t.toLowerCase().includes(tagLower));
      });
    }

    const total = articles.length;
    const start = (page - 1) * limit;
    const paginated = articles.slice(start, start + limit);

    return paginatedResponse(paginated, page, limit, total);
  } catch (error) {
    console.error('Error searching articles:', error);
    return errorResponse('Failed to search articles');
  }
}
