import { Metadata } from 'next';
import { toISOString } from '@/lib/utils';
import type { Article, Category, SiteSettings } from '@/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://merantireport.com';
const SITE_NAME = 'Meranti Report';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export function generateArticleMetadata(article: Article): Metadata {
  const title = article.seoTitle || `${article.title} - ${SITE_NAME}`;
  const description = article.seoDescription || article.excerpt;
  const url = `${SITE_URL}/berita/${article.slug}`;
  const ogImage = article.featuredImage || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical: article.canonicalUrl || url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: toISOString(article.publishedAt) ?? undefined,
      modifiedTime: toISOString(article.updatedAt) ?? undefined,
      authors: [article.authorName],
      tags: article.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    keywords: article.seoKeywords || article.tags,
  };
}

export function generateCategoryMetadata(category: Category, page: number = 1): Metadata {
  const title = `${category.name} - ${SITE_NAME}`;
  const description = category.description || `Berita terbaru seputar ${category.name} di Meranti Report`;
  const url = `${SITE_URL}/kategori/${category.slug}${page > 1 ? `?page=${page}` : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export function generateSiteMetadata(settings?: SiteSettings): Metadata {
  const title = settings?.seo.defaultTitle || `${SITE_NAME} - Kabar Meranti, Dari Kita Untuk Kita`;
  const description = settings?.seo.metaDescription || settings?.general.description || 'Portal berita lokal terpercaya di Kepulauan Meranti. Menyajikan informasi terkini, akurat, dan terpercaya.';

  return {
    title: {
      default: title,
      template: `%s - ${SITE_NAME}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'id_ID',
      images: settings?.seo.ogImage
        ? [{ url: settings.seo.ogImage, width: 1200, height: 630 }]
        : [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: settings?.seo.googleVerification
      ? { google: settings.seo.googleVerification }
      : undefined,
  };
}

export function generateNewsArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage,
    datePublished: toISOString(article.publishedAt),
    dateModified: toISOString(article.updatedAt),
    author: {
      '@type': 'Person',
      name: article.authorName,
      image: article.authorPhoto,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/berita/${article.slug}`,
    },
    articleSection: article.categoryName,
    keywords: article.tags.join(', '),
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateOrganizationSchema(settings?: SiteSettings) {
  // Build sameAs array from social media settings
  const sameAs: string[] = [];
  if (settings?.socialMedia?.facebook) sameAs.push(settings.socialMedia.facebook);
  if (settings?.socialMedia?.instagram) sameAs.push(settings.socialMedia.instagram);
  if (settings?.socialMedia?.twitter) sameAs.push(settings.socialMedia.twitter);
  if (settings?.socialMedia?.youtube) sameAs.push(settings.socialMedia.youtube);
  if (settings?.socialMedia?.tiktok) sameAs.push(settings.socialMedia.tiktok);
  if (settings?.socialMedia?.whatsapp) sameAs.push(settings.socialMedia.whatsapp);

  const email = settings?.general?.email || 'redaksi@merantireport.com';
  const phone = settings?.general?.phone;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      email,
      ...(phone ? { telephone: phone } : {}),
    },
    ...(settings?.general?.address ? { address: settings.general.address } : {}),
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'id',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateCollectionPageSchema(title: string, description: string, url: string, itemCount?: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    ...(itemCount !== undefined ? { numberOfItems: itemCount } : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemCount,
    },
  };
}

export function generateImageGallerySchema(images: { url: string; caption?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Galeri Foto Meranti Report',
    url: `${SITE_URL}/foto`,
    associatedMedia: images.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      caption: img.caption || '',
    })),
  };
}
