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

  try {
    // Fetch all published articles
    const articlesRes = await fetch(`${SITE_URL}/api/articles?limit=100`, {
      next: { revalidate: 3600 },
    });

    if (articlesRes.ok) {
      const articlesData = await articlesRes.json();
      const articles = articlesData.data || articlesData || [];

      for (const article of articles) {
        entries.push({
          url: `${SITE_URL}/berita/${article.slug}`,
          lastModified: new Date(article.updatedAt || article.createdAt),
          changeFrequency: 'daily',
          priority: 0.8,
        });
      }
    }

    // Fetch all categories
    const categoriesRes = await fetch(`${SITE_URL}/api/categories`, {
      next: { revalidate: 3600 },
    });

    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      const categories = categoriesData.data || categoriesData || [];

      for (const category of categories) {
        entries.push({
          url: `${SITE_URL}/kategori/${category.slug}`,
          lastModified: new Date(category.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // If fetch fails, just return the homepage entry
  }

  return entries;
}
