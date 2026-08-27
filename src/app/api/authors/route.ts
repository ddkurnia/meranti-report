import { NextRequest, NextResponse } from 'next/server';
import { isFirebaseConfigured, handleCors, successResponse, errorResponse, getAuthUser, generateSlug } from '@/lib/api-helpers';
import { DEMO_AUTHORS } from '@/lib/mock-data';

export async function OPTIONS(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;
  return new NextResponse(null, { status: 405 });
}

// GET /api/authors
export async function GET(request: NextRequest) {
  const cors = handleCors(request);
  if (cors) return cors;

  try {
    if (!isFirebaseConfigured()) {
      return successResponse(DEMO_AUTHORS);
    }

    const { adminDb } = await import('@/lib/firebase/admin');
    const snap = await adminDb.collection('authors').orderBy('name', 'asc').get();
    const authors = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return successResponse(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return errorResponse('Failed to fetch authors');
  }
}

// POST /api/authors
export async function POST(request: NextRequest) {
  try {
    const uid = await getAuthUser(request);
    if (!uid && isFirebaseConfigured()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, photo, bio, position, facebook, instagram, twitter } = body;

    if (!name) return errorResponse('Name is required', 400);

    const authorSlug = slug || generateSlug(name);

    if (!isFirebaseConfigured()) {
      const newAuthor = {
        id: `author-${Date.now()}`,
        name,
        slug: authorSlug,
        photo: photo || undefined,
        bio: bio || undefined,
        position: position || undefined,
        facebook: facebook || undefined,
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return NextResponse.json({ success: true, data: newAuthor }, { status: 201 });
    }

    const { adminDb } = await import('@/lib/firebase/admin');

    const authorData = {
      name,
      slug: authorSlug,
      photo: photo || null,
      bio: bio || null,
      position: position || null,
      facebook: facebook || null,
      instagram: instagram || null,
      twitter: twitter || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('authors').add(authorData);
    return NextResponse.json({ success: true, data: { id: docRef.id, ...authorData } }, { status: 201 });
  } catch (error) {
    console.error('Error creating author:', error);
    return errorResponse('Failed to create author');
  }
}
