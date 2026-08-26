import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, handleCors, successResponse, errorResponse } from '@/lib/api-helpers';
import { DEMO_ARTICLES, DEFAULT_CATEGORIES } from '@/lib/mock-data';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/analytics
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    // DEMO MODE
    if (!isFirebaseAdminConfigured()) {
      const days = parseInt(period, 10);
      const dailyViews = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 800) + 200,
      }));

      const todayViews = dailyViews[dailyViews.length - 1].views;
      const weekViews = dailyViews.slice(-7).reduce((sum, d) => sum + d.views, 0);
      const monthViews = dailyViews.reduce((sum, d) => sum + d.views, 0);

      const popularArticles = [...DEMO_ARTICLES]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)
        .map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          views: a.views,
          categoryName: a.categoryName,
          publishedAt: a.publishedAt,
        }));

      // Count articles per category
      const categoryCount: Record<string, { name: string; slug: string; count: number }> = {};
      DEMO_ARTICLES.forEach((a) => {
        if (!categoryCount[a.categoryId]) {
          categoryCount[a.categoryId] = {
            name: a.categoryName,
            slug: a.categorySlug,
            count: 0,
          };
        }
        categoryCount[a.categoryId].count++;
      });

      const popularCategories = Object.values(categoryCount)
        .sort((a, b) => b.count - a.count);

      return successResponse({
        views: {
          today: todayViews,
          week: weekViews,
          month: monthViews,
          daily: dailyViews,
        },
        popularArticles,
        popularCategories,
        totalArticles: DEMO_ARTICLES.length,
        totalAuthors: 3,
      });
    }

    // FIREBASE MODE
    const { adminDb } = await import('@/lib/firebase/admin');
    const days = parseInt(period, 10);

    // Get views data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const viewsSnap = await adminDb
      .collection('views')
      .where('createdAt', '>=', startDate)
      .get();

    // Aggregate daily views
    const dailyViewsMap: Record<string, number> = {};
    viewsSnap.docs.forEach((doc) => {
      const d = doc.data();
      const date = (d.createdAt?.toDate?.() || d.createdAt) as Date;
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        dailyViewsMap[dateStr] = (dailyViewsMap[dateStr] || 0) + 1;
      }
    });

    const dailyViews = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      return { date: dateStr, views: dailyViewsMap[dateStr] || 0 };
    });

    const todayViews = viewsSnap.docs.filter((doc) => {
      const d = doc.data();
      const date = d.createdAt?.toDate?.() || d.createdAt;
      if (!date) return false;
      const today = new Date();
      return (date as Date).toDateString() === today.toDateString();
    }).length;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekViews = viewsSnap.docs.filter((doc) => {
      const d = doc.data();
      const date = d.createdAt?.toDate?.() || d.createdAt;
      return date && new Date(date as Date) >= weekAgo;
    }).length;

    const monthViews = viewsSnap.size;

    // Popular articles
    const articlesSnap = await adminDb
      .collection('articles')
      .where('status', '==', 'published')
      .orderBy('views', 'desc')
      .limit(10)
      .get();

    const popularArticles = articlesSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title,
        slug: data.slug,
        views: data.views || 0,
        categoryName: data.categoryName,
        publishedAt: data.publishedAt,
      };
    });

    // Popular categories
    const allArticles = await adminDb
      .collection('articles')
      .where('status', '==', 'published')
      .get();

    const categoryCount: Record<string, { name: string; slug: string; count: number }> = {};
    allArticles.docs.forEach((doc) => {
      const d = doc.data();
      const catId = d.categoryId;
      if (!categoryCount[catId]) {
        categoryCount[catId] = { name: d.categoryName, slug: d.categorySlug, count: 0 };
      }
      categoryCount[catId].count++;
    });

    const popularCategories = Object.values(categoryCount).sort((a, b) => b.count - a.count);

    const authorsSnap = await adminDb.collection('authors').count().get();

    return successResponse({
      views: {
        today: todayViews,
        week: weekViews,
        month: monthViews,
        daily: dailyViews,
      },
      popularArticles,
      popularCategories,
      totalArticles: allArticles.size,
      totalAuthors: authorsSnap.data().count,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return errorResponse('Failed to fetch analytics');
  }
}
