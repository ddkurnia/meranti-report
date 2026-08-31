'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BreadcrumbNav } from '@/components/news/breadcrumb-nav';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import type { TeamMember } from '@/types';

export default function RedaksiPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/team')
      .then((r) => r.json())
      .then((json) => {
        setMembers((json.data || json || []).filter((m: TeamMember) => m.active));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Group: first member as Pimpinan Redaksi, rest as Tim Redaksi
  const pimpinan = members.slice(0, 1);
  const tim = members.slice(1);

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
          <BreadcrumbNav
            items={[
              { label: 'Beranda', href: '/' },
              { label: 'Redaksi' },
            ]}
          />
        </div>

        {/* Page Header */}
        <section className="mx-auto max-w-7xl px-4 pb-8 md:pb-12">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Redaksi</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Tim redaksi Meranti Report yang berkomitmen menyajikan informasi
              terkini, akurat, dan terpercaya dari Kabupaten Kepulauan Meranti.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="mx-auto max-w-7xl px-4 pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <div className="text-center space-y-2">
                    <Skeleton className="h-5 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                    <Skeleton className="h-3 w-40 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="mx-auto max-w-7xl px-4 pb-12 text-center">
            <p className="text-muted-foreground">Belum ada data redaksi.</p>
          </div>
        ) : (
          <>
            {/* Pimpinan Redaksi — Featured */}
            {pimpinan.length > 0 && (
              <section className="mx-auto max-w-7xl px-4 pb-12">
                <div className="border rounded-2xl p-6 md:p-10 bg-gray-50 dark:bg-gray-900/50">
                  <h2 className="text-center text-sm font-bold uppercase tracking-widest text-red-600 mb-8">
                    Pimpinan Redaksi
                  </h2>
                  <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-center">
                    {pimpinan.map((m) => (
                      <div key={m.id} className="flex flex-col items-center text-center max-w-sm">
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-red-600/20 shadow-lg mb-4">
                          {m.photo ? (
                            <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl font-bold text-gray-400">
                              {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold">{m.name}</h3>
                        <p className="text-red-600 font-medium mt-1">{m.position}</p>
                        {m.bio && (
                          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                            {m.bio}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-4">
                          {m.email && (
                            <a href={`mailto:${m.email}`} className="text-muted-foreground hover:text-red-600 transition-colors">
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {m.facebook && (
                            <a href={m.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600 transition-colors">
                              <Facebook className="h-4 w-4" />
                            </a>
                          )}
                          {m.instagram && (
                            <a href={m.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-600 transition-colors">
                              <Instagram className="h-4 w-4" />
                            </a>
                          )}
                          {m.twitter && (
                            <a href={m.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-sky-500 transition-colors">
                              <Twitter className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Tim Redaksi — Grid */}
            {tim.length > 0 && (
              <section className="mx-auto max-w-7xl px-4 pb-12">
                <h2 className="text-center text-sm font-bold uppercase tracking-widest text-red-600 mb-8">
                  Tim Redaksi
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {tim.map((m) => (
                    <div key={m.id} className="flex flex-col items-center text-center group">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-red-600/40 transition-colors shadow-sm mb-3">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400">
                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm leading-tight">{m.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.position}</p>
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="text-xs text-gray-400 hover:text-red-600 mt-1 transition-colors">
                          {m.email}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Contact Section */}
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <div className="border rounded-2xl p-6 md:p-10 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-center text-lg font-bold mb-6">Hubungi Redaksi</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="mailto:redaksi@merantireport.com" className="flex items-center gap-2 hover:text-red-600 transition-colors">
                <Mail className="h-4 w-4" />
                redaksi@merantireport.com
              </a>
              <a href="tel:+6281234567890" className="flex items-center gap-2 hover:text-red-600 transition-colors">
                <Phone className="h-4 w-4" />
                +62 812-3456-7890
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Selat Panjang, Kepulauan Meranti
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
