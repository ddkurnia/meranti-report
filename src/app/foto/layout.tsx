import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';

export const metadata: Metadata = {
  title: 'Galeri Foto',
  description: 'Galeri foto Meranti Report. Dokumentasi visual peristiwa, kegiatan, dan kehidupan masyarakat Kepulauan Meranti.',
  alternates: { canonical: `${SITE_URL}/foto` },
  openGraph: {
    title: 'Galeri Foto - Meranti Report',
    description: 'Galeri foto Meranti Report. Dokumentasi visual peristiwa dan kehidupan masyarakat Kepulauan Meranti.',
    url: `${SITE_URL}/foto`,
    siteName: 'Meranti Report',
    type: 'website',
  },
};

export default function FotoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
