import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, adminDb } from '@/lib/firebase/admin';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'meranti-report';

    if (!file) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipe file tidak didukung. Gunakan JPEG, PNG, WebP, GIF, atau AVIF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 10MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder);

    // Save metadata to Firestore if configured
    if (isFirebaseAdminConfigured() && adminDb) {
      const mediaDoc = {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
        folder: result.folder,
        size: result.bytes,
        uploadedBy: 'unknown',
        createdAt: new Date().toISOString(),
      };
      await adminDb.collection('media').add(mediaDoc);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.public_id,
        publicId: result.public_id,
        secureUrl: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengunggah gambar' },
      { status: 500 }
    );
  }
}
