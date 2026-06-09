import { NextResponse } from 'next/server';
import { uploadToImgbb } from '@/lib/imgbb';

/**
 * POST /api/upload
 * Accepts a multipart/form-data or base64 body and proxies to imgbb.
 *
 * Body (JSON):
 *   { image: "<base64 string>", name?: "filename" }
 *
 * Returns:
 *   { url, displayUrl, thumb, deleteUrl }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { image, name } = body;

    if (!image) {
      return NextResponse.json({ error: 'image is required' }, { status: 400 });
    }

    // Strip data URL prefix if present (e.g. "data:image/png;base64,")
    const base64 = image.replace(/^data:image\/\w+;base64,/, '');

    const result = await uploadToImgbb(base64, name);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('[/api/upload] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
