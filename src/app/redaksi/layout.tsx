import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export const metadata: Metadata = {
  title: 'Redaksi',
  description: 'Tim redaksi Meranti Report. Kenali jurnalis dan editor yang menyajikan berita terpercaya dari Kepulauan Meranti.',
  alternates: { canonical: `${SITE_URL}/redaksi` },
  openGraph: {
    title: 'Redaksi - Meranti Report',
    description: 'Tim redaksi Meranti Report. Kenali jurnalis dan editor yang menyajikan berita terpercaya.',
    url: `${SITE_URL}/redaksi`,
    siteName: 'Meranti Report',
    type: 'website',
  },
};

export default function RedaksiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
