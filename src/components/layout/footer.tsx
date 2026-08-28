'use client';

import Link from 'next/link';
import { useRealtimeCategories } from '@/hooks/use-realtime';
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Kategori', href: '/kategori' },
  { label: 'Video', href: '/video' },
  { label: 'Foto', href: '/foto' },
];

const legalLinks = [
  { label: 'Kebijakan Privasi', href: '/privasi' },
  { label: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
  { label: 'Pedoman Media', href: '/pedoman-media' },
];

export function Footer() {
  const { categories } = useRealtimeCategories();

  return (
    <footer className="bg-[#1a2332] text-gray-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1 mb-4">
              <span className="text-lg font-bold tracking-wider text-white uppercase">
                Meranti
              </span>
              <span className="text-lg font-light tracking-wider text-gray-400 uppercase">
                Report
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Kabar Meranti, Dari Kita Untuk Kita. Portal berita terpercaya yang
              menyajikan informasi terkini dari Kabupaten Kepulauan Meranti dan
              sekitarnya.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Kategori column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Kategori
            </h3>
            <ul className="space-y-2.5">
              {categories.length > 0 ? (
                categories.slice(0, 8).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/kategori/${cat.slug}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                Array.from({ length: 5 }).map((_, i) => (
                  <li
                    key={i}
                    className="h-4 w-24 bg-white/5 rounded animate-pulse"
                  />
                ))
              )}
            </ul>
          </div>

          {/* Tautan column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Tautan
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak column */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Kontak
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Jl. Merdeka No. 1, Selat Panjang, Kepulauan Meranti, Riau</span>
              </li>
              <li>
                <a
                  href="mailto:redaksi@merantireport.com"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>redaksi@merantireport.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+6281234567890"
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>+62 812-3456-7890</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <span>&copy; {new Date().getFullYear()} Meranti Report. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/privasi" className="hover:text-gray-300 transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/syarat-ketentuan" className="hover:text-gray-300 transition-colors">
            Syarat & Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  );
}
