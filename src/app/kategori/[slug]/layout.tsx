import type { Metadata } from 'next';
import { generateCategoryMetadata } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

async function getCategory(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}`
      : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/categories?slug=${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    const categories = json.data || json || [];
    return Array.isArray(categories) ? categories.find((c: any) => c.slug === slug) || null : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Kategori Tidak Ditemukan - Meranti Report',
      description: 'Kategori yang Anda cari tidak tersedia.',
    };
  }

  return generateCategoryMetadata(category);
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
