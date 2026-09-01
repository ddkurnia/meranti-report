'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '@/contexts/site-settings';

export function DynamicThemeColor() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', settings.appearance.accentColor);
    }
  }, [settings.appearance.accentColor]);

  return null;
}
