import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, handleCors, paginatedResponse, successResponse, errorResponse, parsePagination, getAuthUser, generateSlug } from '@/lib/api-helpers';
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
      if (!isFirebaseAdminConfigured()) {
        return successResponse({
          stats: DEMO_DASHBOARD_STATS,
          recent: DEMO_ARTICLES.slice(0, 5),
          popular: [...DEMO_ARTICLES].sort((a, b) => b.views - a.views).slice(0, 5),
        });
      }

      const { adminDb } = await import('@/lib/firebase/admin');
      const [publishedSnap, draftSnap, allArticlesSnap, viewsSnap] = await Promise.all([
        adminDb.collection('articles').where('status', '==', 'published').get(),
        adminDb.collection('articles').where('status', '==', 'draft').get(),
        adminDb.collection('articles').orderBy('createdAt', 'desc').limit(5).get(),
        adminDb.collection('articles').orderBy('views', 'desc').limit(5).get(),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayArticles = publishedSnap.docs.filter((d) => {
        const c = d.data().createdAt?.toDate?.() || d.data().createdAt;
        return c && new Date(c) >= today;
      });

      const totalViews = publishedSnap.docs.reduce((sum, d) => sum + (d.data().views || 0), 0);

      const recent = allArticlesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const popular = viewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      return successResponse({
        stats: {
          totalArticles: publishedSnap.size + draftSnap.size,
          publishedArticles: publishedSnap.size,
          draftArticles: draftSnap.size,
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
      if (!isFirebaseAdminConfigured()) {
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
      let query = adminDb
        .collection('articles')
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(6);

      const catRef = categoryId || category;
      if (catRef) {
        const cat = DEFAULT_CATEGORIES.find((c) => c.id === catRef || c.slug === catRef);
        if (cat) query = adminDb.collection('articles').where('categoryId', '==', cat.id).where('status', '==', 'published').limit(6);
      }

      const snap = await query.get();
      let articles: any[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (exclude) articles = articles.filter((a) => a.id !== exclude);

      return successResponse(articles.slice(0, 6));
    }

    // ============ BREAKING NEWS ============
    if (breaking) {
      if (!isFirebaseAdminConfigured()) {
        const data = DEMO_ARTICLES.filter((a) => a.breaking && a.status === 'published');
        return successResponse(data);
      }

      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb
        .collection('articles')
        .where('breaking', '==', true)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(10)
        .get();

      return successResponse(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    // ============ FEATURED ARTICLES ============
    if (featured) {
      if (!isFirebaseAdminConfigured()) {
        const data = DEMO_ARTICLES.filter((a) => a.featured && a.status === 'published');
        return successResponse(data);
      }

      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb
        .collection('articles')
        .where('featured', '==', true)
        .where('status', '==', 'published')
        .orderBy('publishedAt', 'desc')
        .limit(10)
        .get();

      return successResponse(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    // ============ FIREBASE MODE ============
    if (isFirebaseAdminConfigured()) {
      const { adminDb } = await import('@/lib/firebase/admin');

      let query: any = adminDb.collection('articles').orderBy('publishedAt', 'desc');

      // Check if this is an admin request (has auth with proper role)
      const uid = await getAuthUser(request);
      const isAdminRequest = !!uid;

      // For public requests, only show published
      if (!isAdminRequest || !status) {
        query = adminDb.collection('articles').where('status', '==', 'published').orderBy('publishedAt', 'desc');
      } else if (status && status !== 'all') {
        query = adminDb.collection('articles').where('status', '==', status).orderBy('updatedAt', 'desc');
      } else {
        query = adminDb.collection('articles').orderBy('updatedAt', 'desc');
      }

      let snap = await query.get();
      let articles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

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
    if (!uid && isFirebaseAdminConfigured()) {
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

    if (!isFirebaseAdminConfigured()) {
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
    const { FieldValue } = await import('firebase-admin/firestore');

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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (subheading) articleData.subheading = subheading;
    if (featuredImage) articleData.featuredImage = featuredImage;
    if (imageCaption) articleData.imageCaption = imageCaption;
    if (authorPhoto) articleData.authorPhoto = authorPhoto;
    if (seoTitle) articleData.seoTitle = seoTitle;
    if (seoDescription) articleData.seoDescription = seoDescription;
    if (seoKeywords) articleData.seoKeywords = seoKeywords;
    if (canonicalUrl) articleData.canonicalUrl = canonicalUrl;
    if (status === 'published') articleData.publishedAt = FieldValue.serverTimestamp();

    const docRef = await adminDb.collection('articles').add(articleData);
    const createdArticle = { id: docRef.id, ...articleData };

    return NextResponse.json({ success: true, data: createdArticle }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return errorResponse('Failed to create article');
  }
}
