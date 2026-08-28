'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BreakingNewsTicker } from '@/components/layout/breaking-news-ticker';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreadcrumbNav } from '@/components/news/breadcrumb-nav';
import { NewsletterSection } from '@/components/news/newsletter-section';
import { useRealtimeCategories } from '@/hooks/use-realtime';
import {
  FolderOpen,
  Newspaper,
  ChevronRight,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Building,
  Palette,
  Plane,
  Trophy,
  Cpu,
  Users,
  Scale,
  Leaf,
  MessageSquare,
  Landmark,
  Globe,
} from 'lucide-react';
import type { Category } from '@/types';

const categoryIcons: Record<string, React.ElementType> = {
  'meranti': MapPin,
  'selatpanjang': MapPin,
  'tebing-tinggi': MapPin,
  'merbau': MapPin,
  'rangsang': MapPin,
  'rangsang-barat': MapPin,
  'tebing-tinggi-barat': MapPin,
  'pulau-kijang': MapPin,
  'politik': Landmark,
  'ekonomi-bisnis': Briefcase,
  'pendidikan': GraduationCap,
  'kesehatan': Heart,
  'infrastruktur': Building,
  'budaya': Palette,
  'pariwisata': Plane,
  'olahraga': Trophy,
  'teknologi': Cpu,
  'sosial': Users,
  'hukum-kriminal': Scale,
  'lingkungan': Leaf,
  'opini': MessageSquare,
  'nasional': Globe,
};

export default function KategoriIndexPage() {
  const { categories, loading } = useRealtimeCategories();

  // Separate geographic (wilayah) and topical categories
  const geoCategories = categories.filter((c) =>
    ['meranti', 'selatpanjang', 'tebing-tinggi', 'merbau', 'rangsang', 'rangsang-barat', 'tebing-tinggi-barat', 'pulau-kijang'].includes(c.slug)
  );
  const topicCategories = categories.filter((c) => !geoCategories.includes(c));

  return (
    <>
      <BreakingNewsTicker />
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <BreadcrumbNav
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Kategori' },
            ]}
          />

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Semua Kategori</h1>
            <p className="mt-2 text-muted-foreground">
              Jelajahi berita berdasarkan kategori yang tersedia di Meranti Report.
            </p>
          </div>

          {loading ? (
            <div className="space-y-10">
              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium">Belum Ada Kategori</p>
              <p className="text-sm text-muted-foreground mt-1">Kategori belum tersedia.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Wilayah Section */}
              {geoCategories.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-bold">Wilayah</h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {geoCategories.map((cat) => (
                      <CategoryCard key={cat.id} category={cat} />
                    ))}
                  </div>
                </section>
              )}

              {/* Topik Section */}
              {topicCategories.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-bold">Topik</h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topicCategories.map((cat) => (
                      <CategoryCard key={cat.id} category={cat} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const IconComponent = categoryIcons[category.slug] || Newspaper;
  const hasArticles = (category.articleCount || 0) > 0;

  return (
    <Link
      href={`/kategori/${category.slug}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-lg hover:border-red-200 dark:hover:border-red-900/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
          <IconComponent className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {category.articleCount || 0}
        </Badge>
      </div>
      <h3 className="font-semibold text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {category.description}
        </p>
      )}
      <div className="mt-3 flex items-center text-xs text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
        <span>Lihat berita</span>
        <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
