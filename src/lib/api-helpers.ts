import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Check if Firebase Admin is configured
export function isFirebaseAdminConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  );
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

// Verify auth from request (Authorization header)
export async function getAuthUser(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split('Bearer ')[1];
  if (!token) return null;

  // If Firebase is configured, verify the token
  if (isFirebaseAdminConfigured()) {
    try {
      const { adminAuth } = await import('@/lib/firebase/admin');
      const decoded = await adminAuth.verifyIdToken(token);
      return decoded.uid;
    } catch {
      return null;
    }
  }

  // In demo mode, accept any token that looks valid
  if (token.length > 10) return 'demo-user';
  return null;
}

// Get user role from Firestore
export async function getUserRole(uid: string): Promise<string | null> {
  if (!isFirebaseAdminConfigured()) {
    // In demo mode, return super_admin
    return 'super_admin';
  }
  try {
    const { adminDb } = await import('@/lib/firebase/admin');
    const userDoc = await adminDb.collection('users').doc(uid).get();
    if (!userDoc.exists) return null;
    return userDoc.data()?.role || null;
  } catch {
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

// Convert Firestore document to Article type
export function formatDoc<T extends Record<string, unknown>>(doc: { id: string; data: () => Record<string, unknown> }): T & { id: string } {
  const data = doc.data();
  const result: Record<string, unknown> = { id: doc.id };
  for (const [key, value] of Object.entries(data)) {
    result[key] = value;
  }
  return result as T & { id: string };
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
