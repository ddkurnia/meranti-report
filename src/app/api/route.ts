import { NextResponse } from "next/server";
import { handleCors } from '@/lib/api-helpers';
import type { NextRequest } from 'next/server';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Meranti Report API v1.0',
    endpoints: {
      articles: '/api/articles',
      categories: '/api/categories',
      media: '/api/media',
      upload: '/api/upload',
      auth: '/api/auth',
      settings: '/api/settings',
      views: '/api/views',
      search: '/api/search',
      seed: '/api/seed',
      authors: '/api/authors',
      comments: '/api/comments',
      analytics: '/api/analytics',
    },
  });
}