import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Check if server-side Firebase (adminDb) is available for API routes
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

// Check if client-side Firebase is configured (for components)
export function isFirebaseClientConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

// Success response helper
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, {
    status,
    headers: corsHeaders,
  });
}

// Paginated response helper
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }, {
    status,
    headers: corsHeaders,
  });
}

// Error response helper
export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ success: false, error: message }, {
    status,
    headers: corsHeaders,
  });
}

// Unauthorized response
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401, headers: corsHeaders }
  );
}

// Verify Firebase ID token via Admin SDK
export async function verifyIdToken(token: string): Promise<string | null> {
  try {
    const { adminAuth } = await import('@/lib/firebase/admin');
    if (!adminAuth) {
      console.error('[verifyIdToken] adminAuth is null - Firebase Admin SDK not initialized');
      return null;
    }
    const decoded = await adminAuth.verifyIdToken(token);
    console.log('[verifyIdToken] Token verified for uid:', decoded.uid);
    return decoded.uid;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[verifyIdToken] Token verification failed:', msg);
    return null;
  }
}

// Verify auth from request - returns uid string or null
export async function getAuthUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[getAuthUser] No Authorization header or not Bearer token');
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    console.warn('[getAuthUser] Empty token after Bearer prefix');
    return null;
  }

  console.log('[getAuthUser] Verifying token, length:', token.length);
  const uid = await verifyIdToken(token);
  return uid;
}

// Get user role from Firestore
export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return null;
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      console.warn('[getUserRole] No user document found for uid:', uid);
      return null;
    }
    const data = userDoc.data();
    const role = (data as Record<string, unknown>)?.role as string || null;
    return role;
  } catch (err) {
    console.error('[getUserRole] Error fetching user role:', err);
    return null;
  }
}

// Require specific role
export async function requireRole(
  request: NextRequest,
  roles: string[]
): Promise<{ authorized: boolean; userId?: string; role?: string }> {
  const uid = await getAuthUser(request);
  if (!uid) return { authorized: false };

  const role = await getUserRole(uid);
  if (!role || !roles.includes(role)) return { authorized: false };

  return { authorized: true, userId: uid, role };
}

// Convert Firestore timestamp to Date
export function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === 'string') return new Date(value);
  if (typeof value === 'number') return new Date(value);
  return undefined;
}

// Generate slug from string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Parse pagination params
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  return { page, limit };
}