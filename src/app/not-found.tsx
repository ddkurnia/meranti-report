import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-[var(--site-primary,#1a2332)] dark:text-gray-600">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            Silakan kembali ke halaman utama.
          </p>
          <Link href="/">
            <Button className="mt-8 gap-2 bg-[var(--site-primary,#1a2332)] hover:opacity-90">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}