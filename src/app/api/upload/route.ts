import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, handleCors, successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers';
import { uploadImage } from '@/lib/cloudinary';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// POST /api/upload
export async function POST(request: NextRequest) {
  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseAdminConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'meranti-report';

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.', 400);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('File size exceeds 10MB limit', 400);
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // Demo mode - return mock response
      const demoResult = {
        id: `media-${Date.now()}`,
        publicId: `meranti-report/demo-${Date.now()}`,
        secureUrl: 'https://placehold.co/1200x600/1a2332/ffffff?text=Uploaded+Image',
        url: 'https://placehold.co/1200x600/1a2332/ffffff?text=Uploaded+Image',
        width: 1200,
        height: 600,
        format: 'jpg',
        resourceType: 'image',
        folder,
        size: file.size,
        uploadedBy: uid || 'demo-user',
        createdAt: new Date(),
      };

      // If Firebase is configured, save to Firestore
      if (isFirebaseAdminConfigured()) {
        try {
          const { adminDb } = await import('@/lib/firebase/admin');
          const { FieldValue } = await import('firebase-admin/firestore');
          const { ...mediaData } = demoResult;
          await adminDb.collection('media').add({
            ...mediaData,
            createdAt: FieldValue.serverTimestamp(),
          });
        } catch (e) {
          console.error('Error saving media to Firestore:', e);
        }
      }

      return NextResponse.json({ success: true, data: demoResult }, { status: 201 });
    }

    // Upload to Cloudinary
    const result = await uploadImage(file, folder);

    // Save metadata to Firestore
    if (isFirebaseAdminConfigured()) {
      try {
        const { adminDb } = await import('@/lib/firebase/admin');
        const { FieldValue } = await import('firebase-admin/firestore');
        await adminDb.collection('media').add({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resource_type,
          folder: result.folder,
          size: result.bytes,
          uploadedBy: uid || 'unknown',
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (e) {
        console.error('Error saving media to Firestore:', e);
      }
    }

    const mediaItem = {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
      folder: result.folder,
      size: result.bytes,
    };

    return NextResponse.json({ success: true, data: mediaItem }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return errorResponse('Failed to upload file');
  }
}
