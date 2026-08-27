import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, paginatedResponse, getAuthUser, requireRole, parsePagination } from '@/lib/api-helpers';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/comments?articleId=xxx&status=xxx
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    const status = searchParams.get('status');
    const { page, limit } = parsePagination(searchParams);

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
    let query = adminDb.collection('comments').orderBy('createdAt', 'desc');

    const snap = await query.get();
    let comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (articleId) comments = comments.filter((c: Record<string, unknown>) => c.articleId === articleId);
    if (status) comments = comments.filter((c: Record<string, unknown>) => c.status === status);
    else comments = comments.filter((c: Record<string, unknown>) => c.status === 'approved');

    const total = comments.length;
    const start = (page - 1) * limit;
    return paginatedResponse(comments.slice(start, start + limit), page, limit, total);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return errorResponse('Failed to fetch comments');
  }
}

// POST /api/comments - Create comment (public) or update status (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, authorName, content, authorEmail, parentId, commentId, status } = body;

    // If commentId is provided, this is an admin update (change status)
    if (commentId && status) {
      const { authorized } = await requireRole(request, ['super_admin', 'editor']);
      if (!authorized && isFirebaseConfigured()) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

      const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);
      await adminDb.collection('comments').doc(commentId).update({
        status,
        updatedAt: new Date().toISOString(),
      });
      return successResponse({ id: commentId, status });
    }

    // Public comment creation
    if (!articleId || !authorName || !content) {
      return errorResponse('articleId, authorName, and content are required', 400);
    }

    if (!isFirebaseConfigured()) return errorResponse('Firebase not configured', 503);

    const { adminDb } = await import('@/lib/firebase/admin');
    if (!adminDb) return errorResponse('Firebase not configured', 503);

    // Check if comments require approval
    let autoApprove = true;
    try {
      const settingsDoc = await adminDb.collection('settings').doc('site').get();
      if (settingsDoc.exists) {
        autoApprove = !settingsDoc.data()?.comments?.requireApproval;
      }
    } catch {
      // Default to requiring approval
      autoApprove = false;
    }

    const commentData = {
      articleId,
      authorName,
      authorEmail: authorEmail || null,
      content,
      status: autoApprove ? 'approved' : 'pending',
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('comments').add(commentData);
    return NextResponse.json({ success: true, data: { id: docRef.id, ...commentData } }, { status: 201 });
  } catch (error) {
    console.error('Error with comment:', error);
    return errorResponse('Failed to process comment');
  }
}
