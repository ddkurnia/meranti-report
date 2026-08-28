import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, handleCors, successResponse, errorResponse } from '@/lib/api-helpers';
import { uploadImage, type CloudinaryUploadResult } from '@/lib/cloudinary';
import { isFirebaseConfigured } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// POST /api/upload - Upload images to Cloudinary + save metadata to Firestore
export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return errorResponse('No files provided', 400);
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    const results: CloudinaryUploadResult[] = [];
    const mediaDocs: Record<string, unknown>[] = [];
    const now = new Date().toISOString();

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadImage(buffer, 'meranti-report');
      results.push(uploadResult);

      mediaDocs.push({
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        url: uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
        bytes: uploadResult.bytes,
        folder: uploadResult.folder,
        fileName: file.name,
        mimeType: file.type,
        uploadedBy: uid,
        createdAt: now,
      });
    }

    // Save media metadata to Firestore
    if (adminDb && mediaDocs.length > 0) {
      const batch = adminDb.batch();
      for (const doc of mediaDocs) {
        const ref = adminDb.collection('media').doc();
        batch.set(ref, doc);
      }
      await batch.commit();
    }

    return NextResponse.json({ ok: true, data: results }, {
      status: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return errorResponse('Failed to upload files');
  }
}
