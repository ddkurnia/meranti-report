import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// POST /api/upload - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'meranti-report';

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG', 400);
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size: 10MB', 400);
    }

    // Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return errorResponse('Cloudinary not configured', 503);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create form data for Cloudinary
    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', new Blob([buffer], { type: file.type }));
    cloudinaryForm.append('folder', folder);
    cloudinaryForm.append('upload_preset', 'ml_unsigned'); // Try unsigned first

    // Try unsigned upload first
    let uploadResult: Record<string, unknown> | null = null;
    
    try {
      const unsignedRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: cloudinaryForm,
        }
      );
      const unsignedData = await unsignedRes.json();
      if (unsignedData.public_id) {
        uploadResult = unsignedData;
      }
    } catch {}

    // If unsigned failed, try signed upload
    if (!uploadResult) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const crypto = await import('crypto');
      
      const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      const signedForm = new FormData();
      signedForm.append('file', new Blob([buffer], { type: file.type }));
      signedForm.append('folder', folder);
      signedForm.append('timestamp', timestamp);
      signedForm.append('api_key', apiKey);
      signedForm.append('signature', signature);

      const signedRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: signedForm,
        }
      );
      const signedData = await signedRes.json();
      
      if (signedData.error) {
        return errorResponse(`Cloudinary error: ${signedData.error.message}`, 400);
      }
      uploadResult = signedData;
    }

    if (!uploadResult) {
      return errorResponse('Failed to upload to Cloudinary', 500);
    }

    // Save metadata to Firestore
    const mediaData = {
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      url: uploadResult.url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      resourceType: uploadResult.resource_type,
      folder: uploadResult.folder,
      size: file.size,
      uploadedBy: uid || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured()) {
      try {
        const { adminDb } = await import('@/lib/firebase/admin');
        if (adminDb) {
          await adminDb.collection('media').add(mediaData);
        }
      } catch (err) {
        console.error('Failed to save media metadata to Firestore:', err);
      }
    }

    return NextResponse.json({ success: true, data: mediaData }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return errorResponse('Failed to upload file');
  }
}
