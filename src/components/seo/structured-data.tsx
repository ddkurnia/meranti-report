'use client';

import { useSiteSettings } from '@/contexts/site-settings';
import { JsonLd } from '@/components/seo/json-ld';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

/** Renders JSON-LD schemas using the latest site settings (social media, contact, etc.) */
export function StructuredData() {
  const { settings } = useSiteSettings();
  return <JsonLd schemas={[generateOrganizationSchema(settings), generateWebSiteSchema()]} />;
}
