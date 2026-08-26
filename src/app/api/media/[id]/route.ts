import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, handleCors, successResponse, errorResponse, getAuthUser, requireRole } from '@/lib/api-helpers';
import { deleteImage, extractPublicId } from '@/lib/cloudinary';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// DELETE /api/media/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await requireRole(request, ['super_admin', 'editor', 'author']);
    if (!authorized && isFirebaseAdminConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!isFirebaseAdminConfigured()) {
      // Demo mode - just return success
      return successResponse({ deleted: true });
    }

    const { adminDb } = await import('@/lib/firebase/admin');

    // Get media item to find Cloudinary public ID
    const doc = await adminDb.collection('media').doc(id).get();
    if (!doc.exists) return errorResponse('Media not found', 404);

    const mediaData = doc.data();
    if (!mediaData) return errorResponse('Media data not found', 404);

    // Delete from Cloudinary
    try {
      if (mediaData.publicId) {
        await deleteImage(mediaData.publicId);
      } else if (mediaData.secureUrl) {
        const publicId = extractPublicId(mediaData.secureUrl);
        if (publicId) await deleteImage(publicId);
      }
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue to delete from Firestore even if Cloudinary fails
    }

    // Delete from Firestore
    await adminDb.collection('media').doc(id).delete();

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return errorResponse('Failed to delete media');
  }
}
