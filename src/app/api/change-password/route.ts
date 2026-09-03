import { NextRequest, NextResponse } from 'next/server';
import { handleCors, successResponse, errorResponse, getAuthUser } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// PUT /api/change-password
export async function PUT(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    // Verify the user is authenticated
    const uid = await getAuthUser(request);
    if (!uid) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { newPassword } = body;

    // Validate new password
    if (!newPassword || typeof newPassword !== 'string') {
      return errorResponse('Password baru wajib diisi.');
    }

    if (newPassword.length < 6) {
      return errorResponse('Password baru minimal 6 karakter.');
    }

    if (newPassword.length > 128) {
      return errorResponse('Password baru maksimal 128 karakter.');
    }

    const { adminAuth } = await import('@/lib/firebase/admin');
    if (!adminAuth) {
      return errorResponse('Firebase not configured', 503);
    }

    // Update password via Admin SDK
    await adminAuth.updateUser(uid, {
      password: newPassword,
    });

    return successResponse({ message: 'Password berhasil diubah.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Error changing password:', msg);

    // Handle specific Firebase errors
    if (msg.includes('WEAK_PASSWORD')) {
      return errorResponse('Password terlalu lemah. Gunakan minimal 6 karakter.');
    }
    if (msg.includes('not-found') || msg.includes('USER_NOT_FOUND')) {
      return errorResponse('Pengguna tidak ditemukan.', 404);
    }

    return errorResponse('Gagal mengubah password. Silakan coba lagi.');
  }
}
