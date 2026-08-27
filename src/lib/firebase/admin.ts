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
    const saKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!saKeyBase64) {
      console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY not set');
      return;
    }

    const serviceAccount = JSON.parse(Buffer.from(saKeyBase64, 'base64').toString('utf8'));

    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else {
      adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    _isConfigured = true;
    console.log('[Firebase Admin] Initialized successfully for project:', serviceAccount.project_id);
  } catch (error) {
    console.error('[Firebase Admin] Initialization failed:', error);
  }
}

// Auto-init on module load (server-side only)
initAdmin();

export { adminDb, adminAuth };
export function isFirebaseAdminConfigured(): boolean {
  return _isConfigured && adminDb !== null;
}
