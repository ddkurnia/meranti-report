import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export const metadata: Metadata = {
  title: 'Pencarian',
  description: 'Cari berita, artikel, dan informasi di Meranti Report. Temukan liputan terkini dari Kepulauan Meranti.',
  alternates: { canonical: `${SITE_URL}/search` },
  openGraph: {
    title: 'Pencarian - Meranti Report',
    description: 'Cari berita dan informasi di Meranti Report.',
    url: `${SITE_URL}/search`,
    siteName: 'Meranti Report',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
