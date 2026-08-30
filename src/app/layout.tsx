import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { JsonLd } from '@/components/seo/json-ld';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';
import { PwaInstallButton } from '@/components/pwa/install-button';
import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar';

export const metadata: Metadata = {
  title: {
    default: 'Meranti Report - Kabar Meranti, Dari Kita Untuk Kita',
    template: '%s - Meranti Report',
  },
  description: 'Portal berita lokal terpercaya di Kepulauan Meranti. Menyajikan informasi terkini, akurat, dan terpercaya.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com'),
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Meranti Report',
    description: 'Portal berita lokal terpercaya di Kepulauan Meranti. Menyajikan informasi terkini, akurat, dan terpercaya.',
    siteName: 'Meranti Report',
    type: 'website',
    locale: 'id_ID',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meranti Report',
    description: 'Portal berita lokal terpercaya di Kepulauan Meranti.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Meranti Report" />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
        {/* Initial splash screen — shown instantly before React hydrates, removed on load */}
        <div
          id="initial-splash"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
            background: '#ffffff',
          }}
        >
          <img src="/loading-logo.png" alt="" style={{ width: 96, height: 96, objectFit: 'contain' }} />
          <div style={{ width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#dc2626', borderRadius: '50%' }} className="splash-spinner" />
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var s=document.getElementById('initial-splash');
                if(!s)return;
                var st=document.createElement('style');
                st.textContent='.splash-spinner{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}';
                document.head.appendChild(st);
                function hide(){s.style.transition='opacity .3s';s.style.opacity='0';setTimeout(function(){s.remove()},300)}
                if(document.readyState==='complete')hide();
                else window.addEventListener('load',hide);
                setTimeout(hide,4000);
              })();
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <JsonLd schemas={[generateOrganizationSchema(), generateWebSiteSchema()]} />
            {children}
            <PwaInstallButton />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
