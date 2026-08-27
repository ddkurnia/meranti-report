import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;
let _isConfigured = false;

function parseServiceAccount(raw: string): Record<string, unknown> {
  // Try 1: Raw JSON string
  try {
    const parsed = JSON.parse(raw);
    if (parsed.project_id && parsed.private_key) return parsed;
  } catch {}

  // Try 2: Base64 encoded JSON
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    if (parsed.project_id && parsed.private_key) return parsed;
  } catch {}

  // Try 3: File path
  try {
    const filePath = path.resolve(raw);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(fileContent);
      if (parsed.project_id && parsed.private_key) return parsed;
    }
  } catch {}

  throw new Error('Could not parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON, base64, or file path');
}

function initAdmin() {
  if (_isConfigured) return;

  try {
    const saKeyRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const gacPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!saKeyRaw && !gacPath) {
      console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS not set');
      return;
    }

    let serviceAccount: Record<string, unknown> | undefined;

    if (saKeyRaw) {
      serviceAccount = parseServiceAccount(saKeyRaw);
    }

    if (getApps().length === 0) {
      if (serviceAccount) {
        adminApp = initializeApp({
          credential: cert(serviceAccount as any),
          projectId: serviceAccount.project_id as string,
        });
      } else {
        // Use GOOGLE_APPLICATION_CREDENTIALS (Application Default Credentials)
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      }
    } else {
      adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    _isConfigured = true;
    console.log('[Firebase Admin] Initialized successfully for project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount?.project_id);
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
