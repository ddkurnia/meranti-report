import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, unknown> = {};
  
  // Test 1: Env vars
  const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  results.hasSAKey = !!saKey;
  results.saKeyLength = saKey?.length || 0;
  
  if (saKey) {
    try {
      const parsed = JSON.parse(saKey);
      results.saParsed = !!parsed.private_key;
      results.projectIdFromSA = parsed.project_id;
    } catch (e: unknown) {
      results.saError = (e as Error).message;
    }
  }
  
  // Test 2: Try importing and using admin SDK
  try {
    const { adminDb, adminAuth, isFirebaseAdminConfigured } = await import('@/lib/firebase/admin');
    results.adminDbReady = !!adminDb;
    results.adminAuthReady = !!adminAuth;
    results.isAdminConfigured = isFirebaseAdminConfigured();
    
    if (adminDb) {
      // Test 3: Try a simple Firestore read
      try {
        const snap = await adminDb.collection('categories').limit(1).get();
        results.firestoreRead = 'ok';
        results.firestoreDocCount = snap.size;
      } catch (e: unknown) {
        results.firestoreRead = 'error';
        results.firestoreError = (e as Error).message;
      }
    }
  } catch (e: unknown) {
    results.adminImportError = (e as Error).message;
  }
  
  return NextResponse.json(results);
}