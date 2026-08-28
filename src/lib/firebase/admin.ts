import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let _isConfigured = false;

function initAdmin() {
  if (_isConfigured) return;

  try {
    const saKeyRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!saKeyRaw) {
      console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY not set');
      return;
    }

    let serviceAccount: Record<string, unknown>;
    try {
      serviceAccount = JSON.parse(saKeyRaw);
    } catch {
      console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
      return;
    }

    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount as Parameters<typeof cert>[0]),
        projectId: serviceAccount.project_id as string,
      });
    } else {
      adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    _isConfigured = true;
    console.log('[Firebase Admin] Initialized for project:', serviceAccount.project_id);
  } catch (error) {
    console.error('[Firebase Admin] Init failed:', error);
  }
}

initAdmin();

export { adminDb, adminAuth };
export function isFirebaseAdminConfigured(): boolean {
  return _isConfigured && adminDb !== null;
}