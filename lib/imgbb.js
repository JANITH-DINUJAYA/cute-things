/**
 * imgbb Upload Utility
 *
 * Never call imgbb directly from the browser — always proxy through
 * /api/upload so the API key stays server-side.
 *
 * Server-side usage:
 *   const result = await uploadToImgbb(base64String);
 *   // result.url  → full-size image URL
 *   // result.thumb → thumbnail URL
 */

const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

/**
 * Upload a base64-encoded image to imgbb.
 * @param {string} base64 - The base64 image data (without the data:image/...;base64, prefix)
 * @param {string} [name]  - Optional file name
 * @returns {Promise<{ url: string, displayUrl: string, thumb: string, deleteUrl: string }>}
 */
export async function uploadToImgbb(base64, name = '') {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new Error('IMGBB_API_KEY is not set');

  const body = new URLSearchParams();
  body.append('key', apiKey);
  body.append('image', base64);
  if (name) body.append('name', name);

  const res = await fetch(IMGBB_API_URL, {
    method: 'POST',
    body,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`imgbb upload failed: ${res.status} — ${text}`);
  }

  const json = await res.json();
  if (!json.success) throw new Error(`imgbb error: ${json.error?.message}`);

  return {
    url:        json.data.url,
    displayUrl: json.data.display_url,
    thumb:      json.data.thumb?.url ?? json.data.url,
    deleteUrl:  json.data.delete_url,
  };
}
