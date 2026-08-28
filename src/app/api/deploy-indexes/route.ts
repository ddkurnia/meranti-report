import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/deploy-indexes?key=meranti-seed-2025
 * Uses firebase-admin's own credential to deploy Firestore composite indexes.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'meranti-seed-2025') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Use firebase-admin's credential (already proven to work on Vercel)
    const { adminDb } = await import('@/lib/firebase/admin');
    const { adminAuth } = await import('@/lib/firebase/admin');
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // Get the app to access its credential
    const { getApps } = await import('firebase-admin/app');
    const apps = getApps();
    if (apps.length === 0) {
      return NextResponse.json({ error: 'No Firebase app' }, { status: 500 });
    }

    const app = apps[0];
    const credential = app.options.credential as any;
    if (!credential || typeof credential.getAccessToken !== 'function') {
      return NextResponse.json({ error: 'No credential available' }, { status: 500 });
    }

    const accessTokenResponse = await credential.getAccessToken();
    const accessToken = accessTokenResponse.access_token;
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
    }

    // Get project ID from the Firebase app (most reliable source)
    const projectId = (app as any).options.projectId;
    if (!projectId) {
      return NextResponse.json({ error: 'No project ID in Firebase app options' }, { status: 500 });
    }

    // Check existing indexes
    const existingRes = await firestoreRequest(
      `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default)/indexes`,
      accessToken
    );
    const existingIndexes: any[] = existingRes.indexes || [];

    const requiredIndexes = [
      { collectionId: 'articles', fields: [{ fieldPath: 'status', order: 'ASCENDING' }, { fieldPath: 'publishedAt', order: 'DESCENDING' }] },
      { collectionId: 'articles', fields: [{ fieldPath: 'breaking', order: 'ASCENDING' }, { fieldPath: 'status', order: 'ASCENDING' }, { fieldPath: 'publishedAt', order: 'DESCENDING' }] },
      { collectionId: 'articles', fields: [{ fieldPath: 'featured', order: 'ASCENDING' }, { fieldPath: 'status', order: 'ASCENDING' }, { fieldPath: 'publishedAt', order: 'DESCENDING' }] },
      { collectionId: 'articles', fields: [{ fieldPath: 'categoryId', order: 'ASCENDING' }, { fieldPath: 'status', order: 'ASCENDING' }, { fieldPath: 'publishedAt', order: 'DESCENDING' }] },
      { collectionId: 'articles', fields: [{ fieldPath: 'status', order: 'ASCENDING' }, { fieldPath: 'views', order: 'DESCENDING' }] },
      { collectionId: 'comments', fields: [{ fieldPath: 'articleId', order: 'ASCENDING' }, { fieldPath: 'status', order: 'ASCENDING' }, { fieldPath: 'createdAt', order: 'DESCENDING' }] },
    ];

    function serializeFields(fields: any[]) {
      return fields.map(f => `${f.fieldPath}:${f.order}`).join(',');
    }

    function indexExists(required: any) {
      return existingIndexes.some(existing => {
        if (existing.collectionId !== required.collectionId) return false;
        if (!existing.fields) return false;
        return serializeFields(existing.fields) === serializeFields(required.fields);
      });
    }

    const results: { index: string; status: string; message?: string }[] = [];

    for (const idx of requiredIndexes) {
      const idxKey = `${idx.collectionId}[${serializeFields(idx.fields)}]`;
      if (indexExists(idx)) {
        results.push({ index: idxKey, status: 'exists' });
        continue;
      }

      try {
        const body = JSON.stringify({
          name: `projects/${projectId}/databases/(default)/indexes/-`,
          collectionId: idx.collectionId,
          fields: idx.fields.map(f => ({ fieldPath: f.fieldPath, order: f.order })),
          queryScope: 'COLLECTION',
        });

        const res = await firestoreRequest(
          `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default)/indexes`,
          accessToken,
          { method: 'POST', body },
        );

        results.push({
          index: idxKey,
          status: res.error ? 'error' : 'queued',
          message: res.error ? JSON.stringify(res.error) : 'Queued for creation',
        });
      } catch (err: any) {
        results.push({ index: idxKey, status: 'error', message: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      projectId,
      results,
      note: 'New indexes take 2-5 minutes to build.',
    });
  } catch (error: any) {
    console.error('Deploy indexes error:', error);
    return NextResponse.json({ error: error.message?.slice(0, 500) || 'Unknown error' }, { status: 500 });
  }
}

async function firestoreRequest(url: string, accessToken: string, options?: { method?: string; body?: string }): Promise<any> {
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options?.body,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`);
  }
}