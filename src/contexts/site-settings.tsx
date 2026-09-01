'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { db, isFirebaseClientConfigured } from '@/lib/firebase/client';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import type { SiteSettings } from '@/types';

const defaultSettings: SiteSettings = {
  general: {
    siteName: 'Meranti Report',
    tagline: 'Kabar Meranti, Dari Kita Untuk Kita',
    description:
      'Portal berita lokal terpercaya di Kepulauan Meranti. Menyajikan informasi terkini, akurat, dan terpercaya.',
    email: 'redaksi@merantireport.com',
    phone: '+62 812-3456-7890',
    address: 'Jl. Merdeka No. 1, Selat Panjang, Kepulauan Meranti, Riau',
    logo: '',
    favicon: '',
  },
  appearance: {
    primaryColor: '#1a2332',
    accentColor: '#dc2626',
    darkMode: false,
    layout: 'default',
  },
  homepage: {
    latestNewsCount: 10,
    popularNewsCount: 5,
    showBreakingNews: true,
    showGallery: false,
    showVideo: false,
    showNewsletter: true,
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    whatsapp: '',
    twitter: '',
  },
  seo: {
    defaultTitle: 'Meranti Report - Kabar Meranti, Dari Kita Untuk Kita',
    metaDescription:
      'Portal berita lokal terpercaya di Kepulauan Meranti. Menyajikan informasi terkini, akurat, dan terpercaya.',
    ogImage: '',
    googleVerification: '',
    robotsConfig: '',
  },
  advertisement: {
    headerAd: { enabled: false },
    homepageAd: { enabled: false },
    articleAd: { enabled: false },
    sidebarAd: { enabled: false },
  },
  comments: {
    enabled: true,
    requireApproval: false,
  },
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!isFirebaseClientConfigured || !db) {
      setLoading(false);
      return;
    }

    const settingsRef = doc(db, 'settings', 'site');
    let unsubscribe: Unsubscribe;

    try {
      unsubscribe = onSnapshot(
        settingsRef,
        (snapshot) => {
          if (!mountedRef.current) return;
          if (snapshot.exists()) {
            const data = snapshot.data();
            setSettings({
              general: {
                siteName: data.general?.siteName ?? defaultSettings.general.siteName,
                tagline: data.general?.tagline ?? defaultSettings.general.tagline,
                description:
                  data.general?.description ?? defaultSettings.general.description,
                email: data.general?.email ?? defaultSettings.general.email,
                phone: data.general?.phone ?? defaultSettings.general.phone,
                address: data.general?.address ?? defaultSettings.general.address,
                logo: data.general?.logo || '',
                favicon: data.general?.favicon || '',
              },
              appearance: {
                primaryColor:
                  data.appearance?.primaryColor ??
                  defaultSettings.appearance.primaryColor,
                accentColor:
                  data.appearance?.accentColor ??
                  defaultSettings.appearance.accentColor,
                darkMode:
                  data.appearance?.darkMode ?? defaultSettings.appearance.darkMode,
                layout:
                  data.appearance?.layout ?? defaultSettings.appearance.layout,
              },
              homepage: {
                latestNewsCount:
                  data.homepage?.latestNewsCount ??
                  defaultSettings.homepage.latestNewsCount,
                popularNewsCount:
                  data.homepage?.popularNewsCount ??
                  defaultSettings.homepage.popularNewsCount,
                showBreakingNews:
                  data.homepage?.showBreakingNews ??
                  defaultSettings.homepage.showBreakingNews,
                showGallery:
                  data.homepage?.showGallery ??
                  defaultSettings.homepage.showGallery,
                showVideo:
                  data.homepage?.showVideo ??
                  defaultSettings.homepage.showVideo,
                showNewsletter:
                  data.homepage?.showNewsletter ??
                  defaultSettings.homepage.showNewsletter,
              },
              socialMedia: {
                facebook: data.socialMedia?.facebook || '',
                instagram: data.socialMedia?.instagram || '',
                tiktok: data.socialMedia?.tiktok || '',
                youtube: data.socialMedia?.youtube || '',
                whatsapp: data.socialMedia?.whatsapp || '',
                twitter: data.socialMedia?.twitter || '',
              },
              seo: {
                defaultTitle:
                  data.seo?.defaultTitle ?? defaultSettings.seo.defaultTitle,
                metaDescription:
                  data.seo?.metaDescription ??
                  defaultSettings.seo.metaDescription,
                ogImage: data.seo?.ogImage || '',
                googleVerification: data.seo?.googleVerification || '',
                robotsConfig:
                  data.seo?.robotsConfig ?? defaultSettings.seo.robotsConfig,
              },
              advertisement: {
                headerAd: {
                  ...defaultSettings.advertisement.headerAd,
                  ...data.advertisement?.headerAd,
                },
                homepageAd: {
                  ...defaultSettings.advertisement.homepageAd,
                  ...data.advertisement?.homepageAd,
                },
                articleAd: {
                  ...defaultSettings.advertisement.articleAd,
                  ...data.advertisement?.articleAd,
                },
                sidebarAd: {
                  ...defaultSettings.advertisement.sidebarAd,
                  ...data.advertisement?.sidebarAd,
                },
              },
              comments: {
                enabled:
                  data.comments?.enabled ?? defaultSettings.comments.enabled,
                requireApproval:
                  data.comments?.requireApproval ??
                  defaultSettings.comments.requireApproval,
              },
            });
          }
          setLoading(false);
        },
        (error) => {
          console.error('SiteSettings onSnapshot error:', error);
          if (mountedRef.current) setLoading(false);
        }
      );
    } catch (err) {
      console.error('SiteSettings listener setup failed:', err);
      if (mountedRef.current) setLoading(false);
    }

    return () => {
      mountedRef.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Apply appearance CSS variables in real-time
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--site-primary', settings.appearance.primaryColor);
    root.style.setProperty(
      '--site-accent',
      settings.appearance.accentColor
    );
  }, [settings.appearance.primaryColor, settings.appearance.accentColor]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export { defaultSettings };
