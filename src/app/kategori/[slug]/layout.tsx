import type { Metadata } from 'next';
import { generateCategoryMetadata } from '@/lib/seo';
import { normalizeDocDates } from '@/lib/api-helpers';
import type { Category } from '@/types';

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

async function getCategory(slug: string) {
  try {
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return null;

    const snap = await adminDb
      .collection('categories')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snap.empty) return null;
    return normalizeDocDates({ id: snap.docs[0].id, ...snap.docs[0].data() }) as unknown as Category;
  } catch (error) {
    console.error('Error fetching category for OG:', error);
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
