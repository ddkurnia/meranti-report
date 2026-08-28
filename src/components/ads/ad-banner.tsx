'use client';

import { cn } from '@/lib/utils';
import type { AdSlot } from '@/types';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  ad: AdSlot;
  className?: string;
}

export function AdBanner({ ad, className }: AdBannerProps) {
  const wrapperClass = cn(
    'relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md rounded-xl w-full',
    className,
  );

  const content = (
    <div className={wrapperClass}>
      <img
        src={ad.imageUrl}
        alt={ad.altText || ad.title || 'Iklan'}
        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
        loading="lazy"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      {/* Ad label */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
        <span>Iklan</span>
        {ad.linkUrl && <ExternalLink className="h-2.5 w-2.5" />}
      </div>
    </div>
  );

  if (ad.linkUrl) {
    return (
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
        title={ad.advertiserName ? `Iklan dari ${ad.advertiserName}` : 'Iklan'}
      >
        {content}
      </a>
    );
  }

  return content;
}

/**
 * Find an ad by slotId from an array of ads.
 * Returns undefined if not found or ad is inactive.
 */
export function findAd(ads: AdSlot[], slotId: string): AdSlot | undefined {
  return ads.find((a) => a.slotId === slotId && a.active && a.imageUrl);
}

/**
 * Render an ad slot by slotId. Returns null if no matching ad.
 */
export function AdSlotRenderer({
  ads,
  slotId,
  className,
}: {
  ads: AdSlot[];
  slotId: string;
  className?: string;
}) {
  const ad = findAd(ads, slotId);
  if (!ad) return null;
  return <AdBanner ad={ad} className={className} />;
}
