import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, paginatedResponse, successResponse, errorResponse, parsePagination, getAuthUser, generateSlug } from '@/lib/api-helpers';
import { DEMO_ARTICLES, DEMO_DASHBOARD_STATS, DEFAULT_CATEGORIES } from '@/lib/mock-data';
import type { Article } from '@/types';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/articles
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePagination(searchParams);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');
    const tag = searchParams.get('tag');
    const search = searchParams.get('q') || searchParams.get('search');
    const breaking = searchParams.get('breaking') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const related = searchParams.get('related') === 'true';
    const exclude = searchParams.get('exclude');
    const dashboard = searchParams.get('dashboard') === 'true';

    // ============ DASHBOARD MODE ============
    if (dashboard) {
      if (!isFirebaseConfigured()) {
        return successResponse({
          stats: DEMO_DASHBOARD_STATS,
          recent: DEMO_ARTICLES.slice(0, 5),
          popular: [...DEMO_ARTICLES].sort((a, b) => b.views - a.views).slice(0, 5),
        });
      }

      const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
      const allSnap = await adminDb.collection('articles').get();
      const allArticles = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const published = allArticles.filter((d: Record<string, unknown>) => d.status === 'published');
      const drafts = allArticles.filter((d: Record<string, unknown>) => d.status === 'draft');
      const recent = [...allArticles].sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.updatedAt as string) || '').localeCompare((a.updatedAt as string) || '')).slice(0, 5);
      const popular = [...allArticles].sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.views as number) || 0) - ((a.views as number) || 0)).slice(0, 5);

      const totalViews = published.reduce((sum: number, d: Record<string, unknown>) => sum + ((d.views as number) || 0), 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayArticles = allArticles.filter((d: Record<string, unknown>) => {
        const c = d.updatedAt as string;
        return c && new Date(c) >= today;
      });

      return successResponse({
        stats: {
          totalArticles: allArticles.length,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          todayArticles: todayArticles.length,
          totalViews,
          todayViews: Math.floor(Math.random() * 500) + 200,
          weekViews: Math.floor(Math.random() * 3000) + 1000,
          monthViews: Math.floor(Math.random() * 10000) + 5000,
        },
        recent,
        popular,
      });
    }

    // ============ RELATED ARTICLES ============
    if (related) {
      if (!isFirebaseConfigured()) {
        const catId = categoryId || category || '';
        let filtered = DEMO_ARTICLES.filter((a) => a.status === 'published');
        if (catId) {
          const cat = DEFAULT_CATEGORIES.find((c) => c.id === catId || c.slug === catId);
          if (cat) filtered = filtered.filter((a) => a.categoryId === cat.id);
        }
        if (exclude) filtered = filtered.filter((a) => a.id !== exclude);
        return successResponse(filtered.slice(0, 6));
      }

      const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
      const snap = await adminDb.collection('articles').get();
      let articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .filter((a: Record<string, unknown>) => a.status === 'published');

      const catRef = categoryId || category;
      if (catRef) {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === catRef || c.slug === catRef);
        if (cat) articles = articles.filter((a: Record<string, unknown>) => a.categoryId === cat.id);
      }
      if (exclude) articles = articles.filter((a) => a.id !== exclude);
      articles.sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.publishedAt as string) || '').localeCompare((a.publishedAt as string) || ''));

      return successResponse(articles.slice(0, 6));
    }

    // ============ BREAKING NEWS ============
    if (breaking) {
      if (!isFirebaseConfigured()) {
        const data = DEMO_ARTICLES.filter((a) => a.breaking && a.status === 'published');
        return successResponse(data);
      }

      const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
      const snap = await adminDb.collection('articles').get();
      const articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .filter((a: Record<string, unknown>) => a.breaking === true && a.status === 'published')
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.publishedAt as string) || '').localeCompare((a.publishedAt as string) || ''));

      return successResponse(articles.slice(0, 10));
    }

    // ============ FEATURED ARTICLES ============
    if (featured) {
      if (!isFirebaseConfigured()) {
        const data = DEMO_ARTICLES.filter((a) => a.featured && a.status === 'published');
        return successResponse(data);
      }

      const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
      const snap = await adminDb.collection('articles').get();
      const articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .filter((a: Record<string, unknown>) => a.featured === true && a.status === 'published')
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) => ((b.publishedAt as string) || '').localeCompare((a.publishedAt as string) || ''));

      return successResponse(articles.slice(0, 10));
    }

    // ============ FIREBASE MODE ============
    if (isFirebaseConfigured()) {
      const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

      // Check if this is an admin request (has auth with proper role)
      const uid = await getAuthUser(request);
      const isAdminRequest = !!uid;

      let snap;

      // For admin requests with status filter
      if (isAdminRequest && status && status !== 'all') {
        snap = await adminDb.collection('articles').where('status', '==', status).get();
      }
      // For public or admin requests without status filter - get all then filter
      else {
        snap = await adminDb.collection('articles').get();
      }

      let articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Filter published for public requests
      if (!isAdminRequest || !status) {
        articles = articles.filter((a: Record<string, unknown>) => a.status === 'published');
      }

      // Client-side filtering for category (by slug or id)
      if (category) {
        const cat = DEFAULT_CATEGORIES.find((c) => c.slug === category || c.id === category);
        if (cat) articles = articles.filter((a: Record<string, unknown>) => a.categoryId === cat.id);
      }
      if (categoryId) {
        articles = articles.filter((a: Record<string, unknown>) => a.categoryId === categoryId);
      }

      // Filter by tag
      if (tag) {
        articles = articles.filter((a: Record<string, unknown>) => {
          const tags = a.tags as string[] || [];
          return tags.some((t: string) => t.toLowerCase().includes(tag.toLowerCase()));
        });
      }

      // Search
      if (search) {
        const q = search.toLowerCase();
        articles = articles.filter((a: Record<string, unknown>) => {
          const title = (a.title as string || '').toLowerCase();
          const excerpt = (a.excerpt as string || '').toLowerCase();
          const content = (a.content as string || '').toLowerCase();
          return title.includes(q) || excerpt.includes(q) || content.includes(q);
        });
      }

      // Exclude
      if (exclude) {
        articles = articles.filter((a: Record<string, unknown>) => a.id !== exclude);
      }

      // Sort by publishedAt desc
      articles.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const da = a.publishedAt as string || '';
        const db2 = b.publishedAt as string || '';
        return db2.localeCompare(da);
      });

      const total = articles.length;
      const start = (page - 1) * limit;
      const paginated = articles.slice(start, start + limit);

      return paginatedResponse(paginated, page, limit, total);
    }

    // ============ DEMO / FALLBACK MODE ============
    let filtered = [...DEMO_ARTICLES].filter((a) => a.status === 'published');

    // Filter by status only for auth requests (demo mode accepts all)
    // In demo mode, we don't have real auth, so just show published

    if (category) {
      const cat = DEFAULT_CATEGORIES.find((c) => c.slug === category || c.id === category);
      if (cat) filtered = filtered.filter((a) => a.categoryId === cat.id);
    }
    if (categoryId) {
      const cat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId);
      if (cat) filtered = filtered.filter((a) => a.categoryId === cat.id);
    }
    if (tag) {
      filtered = filtered.filter((a) => a.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }
    if (exclude) {
      filtered = filtered.filter((a) => a.id !== exclude);
    }

    // Sort by publishedAt desc
    filtered.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return paginatedResponse(paginated, page, limit, total);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return errorResponse('Failed to fetch articles');
  }
}

// POST /api/articles
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title, slug, subheading, excerpt, content, featuredImage, imageCaption,
      categoryId, categoryName, categorySlug, authorId, authorName, authorPhoto,
      tags, status, featured, breaking, seoTitle, seoDescription, seoKeywords, canonicalUrl,
    } = body;

    if (!title || !content || !categoryId) {
      return errorResponse('Title, content, and categoryId are required', 400);
    }

    if (!isFirebaseConfigured()) {
      // Demo mode - return mock created article
      const demoArticle: Article & { id: string } = {
        id: `article-demo-${Date.now()}`,
        title,
        slug: slug || generateSlug(title),
        subheading: subheading || undefined,
        excerpt: excerpt || '',
        content,
        featuredImage: featuredImage || undefined,
        imageCaption: imageCaption || undefined,
        categoryId,
        categoryName: categoryName || 'Demo Category',
        categorySlug: categorySlug || 'demo-category',
        authorId: authorId || 'author-1',
        authorName: authorName || 'Demo Author',
        authorPhoto: authorPhoto || undefined,
        tags: tags || [],
        status: status || 'draft',
        featured: featured || false,
        breaking: breaking || false,
        views: 0,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        seoKeywords: seoKeywords || undefined,
        canonicalUrl: canonicalUrl || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: status === 'published' ? new Date() : undefined,
      };
      return NextResponse.json({ success: true, data: demoArticle }, { status: 201 });
    }

    // Firebase mode
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    const articleSlug = slug || generateSlug(title);
    const now = new Date();

    const articleData: Record<string, unknown> = {
      title,
      slug: articleSlug,
      excerpt: excerpt || '',
      content,
      categoryId,
      categoryName: categoryName || '',
      categorySlug: categorySlug || '',
      authorId: authorId || uid,
      authorName: authorName || '',
      tags: tags || [],
      status: status || 'draft',
      featured: featured || false,
      breaking: breaking || false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (subheading) articleData.subheading = subheading;
    if (featuredImage) articleData.featuredImage = featuredImage;
    if (imageCaption) articleData.imageCaption = imageCaption;
    if (authorPhoto) articleData.authorPhoto = authorPhoto;
    if (seoTitle) articleData.seoTitle = seoTitle;
    if (seoDescription) articleData.seoDescription = seoDescription;
    if (seoKeywords) articleData.seoKeywords = seoKeywords;
    if (canonicalUrl) articleData.canonicalUrl = canonicalUrl;
    if (status === 'published') articleData.publishedAt = new Date().toISOString();

    const docRef = await adminDb.collection('articles').add(articleData);
    const createdArticle = { id: docRef.id, ...articleData };

    return NextResponse.json({ success: true, data: createdArticle }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return errorResponse('Failed to create article');
  }
}
