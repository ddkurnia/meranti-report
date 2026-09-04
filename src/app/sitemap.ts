import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'always',
    priority: 1.0,
  });

  // Static pages
  const staticPages: { path: string; changefreq: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] = [
    { path: '/kategori', changefreq: 'weekly', priority: 0.7 },
    { path: '/redaksi', changefreq: 'monthly', priority: 0.5 },
    { path: '/foto', changefreq: 'daily', priority: 0.6 },
    { path: '/video', changefreq: 'daily', priority: 0.6 },
    { path: '/pedoman-media', changefreq: 'yearly', priority: 0.3 },
    { path: '/privasi', changefreq: 'yearly', priority: 0.2 },
    { path: '/syarat-ketentuan', changefreq: 'yearly', priority: 0.2 },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changefreq,
      priority: page.priority,
    });
  }

  try {
    const { adminDb } = await import('@/lib/firebase/admin');

    if (adminDb) {
      // Fetch ALL published articles (no limit cap)
      const articlesSnap = await adminDb
        .collection('articles')
        .where('status', '==', 'published')
        .orderBy('updatedAt', 'desc')
        .get();

      for (const doc of articlesSnap.docs) {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toDate?.() || data.updatedAt ? new Date(data.updatedAt) : new Date();
        entries.push({
          url: `${SITE_URL}/berita/${data.slug}`,
          lastModified: updatedAt,
          changeFrequency: 'daily',
          priority: 0.8,
        });
      }

      // Fetch all categories
      const categoriesSnap = await adminDb
        .collection('categories')
        .get();

      for (const doc of categoriesSnap.docs) {
        const data = doc.data();
        const updatedAt = data.updatedAt?.toDate?.() || data.updatedAt ? new Date(data.updatedAt) : new Date();
        entries.push({
          url: `${SITE_URL}/kategori/${data.slug}`,
          lastModified: updatedAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Still return static entries even if Firestore fails
  }

  return entries;
}
