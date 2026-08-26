'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, Facebook, Twitter, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(title)}+${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Tautan berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  }, [url]);

  const buttons = [
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      href: whatsappUrl,
      color: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200',
      darkColor: 'dark:hover:bg-green-900/20 dark:hover:text-green-400',
    },
    {
      label: 'Facebook',
      icon: Facebook,
      href: facebookUrl,
      color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
      darkColor: 'dark:hover:bg-blue-900/20 dark:hover:text-blue-400',
    },
    {
      label: 'X',
      icon: Twitter,
      href: twitterUrl,
      color: 'hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300',
      darkColor: 'dark:hover:bg-gray-800 dark:hover:text-gray-200',
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {buttons.map((btn) => (
        <Button
          key={btn.label}
          variant="outline"
          size="sm"
          asChild
          className={`gap-1.5 text-xs ${btn.color} ${btn.darkColor}`}
        >
          <a href={btn.href} target="_blank" rel="noopener noreferrer">
            <btn.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{btn.label}</span>
          </a>
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-1.5 text-xs hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Tersalin!</span>
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Copy Link</span>
          </>
        )}
      </Button>
    </div>
  );
}
