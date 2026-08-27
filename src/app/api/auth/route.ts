import { NextRequest, NextResponse } from 'next/server';
import { handleCors, successResponse, errorResponse } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/auth - Get current user info
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return successResponse(null);
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) return successResponse(null);

    // Check if Firebase Admin is configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Demo mode: return a demo user
      return successResponse({
        uid: 'demo-user',
        email: 'admin@merantireport.id',
        displayName: 'Admin Meranti',
        role: 'super_admin',
        isDemo: true,
      });
    }

    // Firebase mode: verify token
    try {
      const { adminAuth } = await import('@/lib/firebase/admin');
      if (!adminAuth) return successResponse(null);
      const decoded = await adminAuth.verifyIdToken(token);

      // Get user role from Firestore
      let role = 'author';
      try {
        const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
        const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
        if (userDoc.exists) {
          role = userDoc.data()?.role || 'author';
        }
      } catch {
        // User document might not exist yet
      }

      return successResponse({
        uid: decoded.uid,
        email: decoded.email,
        displayName: decoded.name || decoded.email,
        photoURL: decoded.picture,
        role,
        isDemo: false,
      });
    } catch {
      return successResponse(null);
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    return successResponse(null);
  }
}
