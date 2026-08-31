'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BreakingNewsTicker } from '@/components/layout/breaking-news-ticker';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { X, ZoomIn, Download, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  secureUrl?: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  resourceType?: string;
  caption?: string;
  alt?: string;
  title?: string;
  createdAt?: string;
}

export default function FotoPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 24;

  const fetchMedia = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?page=${p}&limit=${perPage}`);
      if (res.ok) {
        const json = await res.json();
        const items: MediaItem[] = json.data || json || [];
        const images = items.filter(
          (m) => m.resourceType === 'image' || !m.resourceType
        );
        setMedia(images);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (_) {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    fetchMedia(page);
  }, [page, fetchMedia]);

  useEffect(() => {
    document.title = 'Galeri Foto - Meranti Report';
  }, []);

  const closeLightbox = () => setSelectedIdx(null);
  const goNext = () => {
    if (selectedIdx !== null && selectedIdx < media.length - 1) setSelectedIdx(selectedIdx + 1);
  };
  const goPrev = () => {
    if (selectedIdx !== null && selectedIdx > 0) setSelectedIdx(selectedIdx - 1);
  };

  useEffect(() => {
    if (selectedIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <>
      <BreakingNewsTicker />
      <Header />

      <main className="flex-1">
        <div className="bg-[var(--site-primary,#1a2332)] py-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center gap-3">
              <Camera className="h-7 w-7 text-red-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Galeri Foto</h1>
            </div>
            <p className="mt-2 text-gray-400 text-sm">
              Dokumentasi foto dari berbagai peristiwa di Kepulauan Meranti dan sekitarnya.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Camera className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Belum ada foto</p>
              <p className="text-sm mt-1">Foto akan ditampilkan setelah diunggah oleh redaksi.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIdx(idx)}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <img
                      src={item.url}
                      alt={item.alt || item.caption || `Foto ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {(item.caption || item.title) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-xs font-medium line-clamp-2">
                          {item.caption || item.title}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Selanjutnya
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {selectedIdx !== null && media[selectedIdx] && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
              aria-label="Tutup"
            >
              <X className="h-7 w-7" />
            </button>

            {selectedIdx > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div
              className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={media[selectedIdx].url}
                alt={media[selectedIdx].alt || media[selectedIdx].caption || `Foto ${selectedIdx + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-3 text-center text-white/70 text-xs flex items-center gap-3">
                <span>{selectedIdx + 1} / {media.length}</span>
                {media[selectedIdx].width && media[selectedIdx].height && (
                  <span>{media[selectedIdx].width} x {media[selectedIdx].height}</span>
                )}
                {media[selectedIdx].size && (
                  <span>{formatSize(media[selectedIdx].size)}</span>
                )}
                <a
                  href={media[selectedIdx].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh
                </a>
              </div>
            </div>

            {selectedIdx < media.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
                aria-label="Foto selanjutnya"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
