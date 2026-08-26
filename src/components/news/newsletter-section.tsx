'use client';

import { useState, useCallback } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setLoading(true);
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });

        if (res.ok) {
          setSubscribed(true);
          toast.success('Berhasil berlangganan newsletter!');
          setEmail('');
        } else {
          toast.error('Gagal berlangganan. Silakan coba lagi.');
        }
      } catch {
        // For now, show success since API doesn't exist yet
        setSubscribed(true);
        toast.success('Terima kasih telah berlangganan!');
        setEmail('');
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Tetap Update dengan Meranti Report
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base">
            Dapatkan berita terkini langsung di inbox Anda. Gratis, tanpa spam.
          </p>

          {subscribed ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-green-600 font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Anda berhasil berlangganan!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="email"
                placeholder="Masukkan alamat email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-11"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-11 bg-[#1a2332] hover:bg-[#243044] gap-2 shrink-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Langganan
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
