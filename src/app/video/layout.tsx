import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export const metadata: Metadata = {
  title: 'Video',
  description: 'Video berita Meranti Report. Saksikan liputan video peristiwa terkini dari Kepulauan Meranti dan sekitarnya.',
  alternates: { canonical: `${SITE_URL}/video` },
  openGraph: {
    title: 'Video - Meranti Report',
    description: 'Video berita Meranti Report. Liputan video peristiwa terkini dari Kepulauan Meranti.',
    url: `${SITE_URL}/video`,
    siteName: 'Meranti Report',
    type: 'website',
  },
};

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
