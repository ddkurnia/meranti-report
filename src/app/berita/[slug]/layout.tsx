import type { Metadata } from 'next';
import { generateArticleMetadata, generateNewsArticleSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { JsonLd } from '@/components/seo/json-ld';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

async function getArticle(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}`
      : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/articles/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: 'Berita Tidak Ditemukan - Meranti Report',
      description: 'Berita yang Anda cari tidak ditemukan.',
    };
  }

  return generateArticleMetadata(article);
}

export default async function ArticleLayout({ children, params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return <>{children}</>;
  }

  const schemas = [
    generateNewsArticleSchema(article),
    generateBreadcrumbSchema([
      { name: 'Beranda', url: SITE_URL },
      { name: article.categoryName, url: `${SITE_URL}/kategori/${article.categorySlug}` },
      { name: article.title, url: `${SITE_URL}/berita/${article.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd schemas={schemas} />
      {children}
    </>
  );
}
