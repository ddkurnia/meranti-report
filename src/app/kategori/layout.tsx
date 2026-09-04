import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export const metadata: Metadata = {
  title: 'Kategori Berita',
  description: 'Jelajahi berita Meranti Report berdasarkan kategori. Temukan liputan terkini dari berbagai topik di Kepulauan Meranti.',
  alternates: { canonical: `${SITE_URL}/kategori` },
  openGraph: {
    title: 'Kategori Berita - Meranti Report',
    description: 'Jelajahi berita Meranti Report berdasarkan kategori.',
    url: `${SITE_URL}/kategori`,
    siteName: 'Meranti Report',
    type: 'website',
  },
};

export default function KategoriLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
