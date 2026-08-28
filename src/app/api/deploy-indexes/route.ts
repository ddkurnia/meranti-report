import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/deploy-indexes?key=meranti-seed-2025
 * Deploys required Firestore composite indexes via REST API.
 * This is needed for onSnapshot realtime queries to work on the public website.
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'meranti-seed-2025') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const saKeyRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!saKeyRaw) {
      return NextResponse.json({ error: 'FIREBASE_SERVICE_ACCOUNT_KEY not set' }, { status: 500 });
    }

    const saKey = JSON.parse(saKeyRaw);
    const projectId = saKey.project_id;
    if (!projectId) {
      return NextResponse.json({ error: 'No project_id in service account' }, { status: 500 });
    }

    // Get access token via JWT
    const accessToken = await getAccessToken(saKey);

    // Check existing indexes
    const existingRes = await firestoreRequest(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/indexes`,
      accessToken
    );
    const existingIndexes: any[] = existingRes.indexes || [];

    // Required indexes for realtime queries
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
      const key = `${idx.collectionId}[${serializeFields(idx.fields)}]`;
      if (indexExists(idx)) {
        results.push({ index: key, status: 'exists' });
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
          `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/indexes`,
          accessToken,
          { method: 'POST', body },
        );

        results.push({
          index: key,
          status: res.error ? 'error' : 'queued',
          message: res.error ? JSON.stringify(res.error) : 'Index queued for creation',
        });
      } catch (err: any) {
        results.push({ index: key, status: 'error', message: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      projectId,
      results,
      note: 'New indexes take 2-5 minutes to build. The website uses API fallback in the meantime.',
    });
  } catch (error: any) {
    console.error('Deploy indexes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getAccessToken(saKey: any): Promise<string> {
  const crypto = await import('crypto');
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: saKey.client_email,
    scope: 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  sign.end();
  const signature = sign.sign(saKey.private_key, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  return tokenData.access_token;
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
  return res.json();
}
