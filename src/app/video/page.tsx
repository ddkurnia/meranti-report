'use client';

import { BreakingNewsTicker } from '@/components/layout/breaking-news-ticker';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Video, PlayCircle } from 'lucide-react';

export default function VideoPage() {
  return (
    <>
      <BreakingNewsTicker />
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-[var(--site-primary,#1a2332)] py-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center gap-3">
              <Video className="h-7 w-7 text-red-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Video</h1>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              Video berita dan peristiwa dari Kepulauan Meranti dan sekitarnya.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <PlayCircle className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Belum ada video</p>
            <p className="text-sm mt-1">Video akan ditampilkan setelah diunggah oleh redaksi.</p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
