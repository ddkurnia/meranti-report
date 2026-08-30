'use client';

import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useRealtimeCategories } from '@/hooks/use-realtime';
import {  Menu,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  X,
  Video,
  Camera,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn, formatDate } from '@/lib/utils';
import type { Category } from '@/types';
// Type kept for reference — categories now come from useRealtimeCategories

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Kategori', href: '/kategori', hasDropdown: true },
  { label: 'Video', href: '/video', icon: Video },
  { label: 'Foto', href: '/foto', icon: Camera },
  { label: 'Redaksi', href: '/redaksi', icon: Users },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { categories } = useRealtimeCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const mobileSheetKey = pathname;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchQuery('');
      }
    },
    [searchQuery, router]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const today = formatDate(new Date());

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-[#1a2332] text-gray-300 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center justify-between text-xs">
          <span className="hidden sm:inline">{today}</span>
          <div className="flex items-center gap-3 ml-auto">
            <a
              href="#"
              className="hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-3.5 w-3.5" />
            </a>
            <span className="hidden md:inline text-white/20 mx-1">|</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-[#1a2332] backdrop-blur-md bg-opacity-95 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:py-3.5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <img
              src="/logo.png"
              alt="Meranti Report"
              className="h-9 sm:h-12 md:h-16 lg:h-[72px] w-auto object-contain"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
            {navItems.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div key={item.label} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                      className={cn(
                        'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-sm transition-colors',
                        isActive(item.href)
                          ? 'text-white bg-white/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform',
                          catDropdownOpen && 'rotate-180'
                        )}
                      />
                    </button>
                    {catDropdownOpen && categories.length > 0 && (() => {
                      const GEO_SLUGS = ['meranti', 'selatpanjang', 'tebing-tinggi', 'tebing-tinggi-barat', 'merbau', 'rangsang', 'rangsang-barat', 'bantan', 'pulau-kijang'];
                      const geoCats = categories.filter((c: Category) => GEO_SLUGS.includes(c.slug));
                      const topicCats = categories.filter((c: Category) => !GEO_SLUGS.includes(c.slug));
                      return (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#243044] rounded-md shadow-xl border border-gray-200 dark:border-white/10 z-50 max-h-[70vh] overflow-y-auto">
                        {geoCats.length > 0 && (
                          <div>
                            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5">
                              Wilayah
                            </div>
                            {geoCats.map((cat: Category) => (
                              <Link
                                key={cat.id}
                                href={`/kategori/${cat.slug}`}
                                className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                onClick={() => setCatDropdownOpen(false)}
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        {topicCats.length > 0 && (
                          <div className={geoCats.length > 0 ? 'border-t border-gray-100 dark:border-white/5' : ''}>
                            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5">
                              Topik
                            </div>
                            {topicCats.map((cat: Category) => (
                              <Link
                                key={cat.id}
                                href={`/kategori/${cat.slug}`}
                                className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                onClick={() => setCatDropdownOpen(false)}
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      );
                    })()}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-sm transition-colors',
                    isActive(item.href)
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari"
            >
              <Search className="h-5 w-5" />
            </Button>

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-white hover:bg-white/10"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet key={mobileSheetKey} open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-gray-300 hover:text-white hover:bg-white/10"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-[#1a2332] border-white/10 p-0">
                <SheetHeader className="p-4 pb-0">
                  <SheetTitle className="text-white">
                    <Link href="/" className="block">
                      <img
                        src="/logo.png"
                        alt="Meranti Report"
                        className="h-8 w-auto object-contain"
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-4 gap-1 overflow-y-auto flex-1 min-h-0" aria-label="Menu mobile">
                  {navItems.map((item) => (
                    <div key={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                          isActive(item.href)
                            ? 'text-white bg-white/10'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {item.label}
                      </Link>
                      {item.hasDropdown && categories.length > 0 && (() => {
                        const GEO_SLUGS = ['meranti', 'selatpanjang', 'tebing-tinggi', 'tebing-tinggi-barat', 'merbau', 'rangsang', 'rangsang-barat', 'bantan', 'pulau-kijang'];
                        const geoCats = categories.filter((c: Category) => GEO_SLUGS.includes(c.slug));
                        const topicCats = categories.filter((c: Category) => !GEO_SLUGS.includes(c.slug));
                        return (
                          <div className="ml-4 border-l border-white/10 pl-3 mt-1 flex flex-col gap-0.5">
                            {geoCats.length > 0 && (
                              <>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3 pt-2 pb-0.5">Wilayah</span>
                                {geoCats.map((cat: Category) => (
                                  <Link
                                    key={cat.id}
                                    href={`/kategori/${cat.slug}`}
                                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors"
                                  >
                                    {cat.name}
                                  </Link>
                                ))}
                              </>
                            )}
                            {topicCats.length > 0 && (
                              <>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-3 pt-3 pb-0.5">Topik</span>
                                {topicCats.map((cat: Category) => (
                                  <Link
                                    key={cat.id}
                                    href={`/kategori/${cat.slug}`}
                                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white rounded-md transition-colors"
                                  >
                                    {cat.name}
                                  </Link>
                                ))}
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </nav>
                <div className="mt-auto p-4 border-t border-white/10 text-xs text-gray-500">
                  Kabar Meranti, Dari Kita Untuk Kita.
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 md:pt-32 px-4">
          <div className="bg-white dark:bg-[#1a2332] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSearch} className="flex items-center">
              <Search className="h-5 w-5 text-gray-400 ml-4 shrink-0" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-gray-400"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mr-2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                aria-label="Tutup pencarian"
              >
                <X className="h-5 w-5" />
              </Button>
            </form>
            <div className="px-4 pb-3 text-xs text-gray-400">
              Tekan Enter untuk mencari atau Esc untuk menutup
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
