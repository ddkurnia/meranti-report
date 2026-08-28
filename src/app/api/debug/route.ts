import { NextResponse } from 'next/server';

export async function GET() {
  const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  let saParsed = false;
  let saError = '';
  let projectIdFromSA = '';
  
  if (saKey) {
    try {
      const parsed = JSON.parse(saKey);
      saParsed = !!parsed.private_key;
      projectIdFromSA = parsed.project_id || '';
    } catch (e: unknown) {
      saError = (e as Error).message;
    }
  }
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    hasProjectId: !!projectId,
    projectId,
    hasSAKey: !!saKey,
    saKeyLength: saKey?.length || 0,
    saParsed,
    saError,
    projectIdFromSA,
    envKeys: Object.keys(process.env).filter(k => k.startsWith('FIREBASE') || k.startsWith('CLOUDINARY') || k.startsWith('NEXT_PUBLIC_FIREBASE')).sort(),
  });
}