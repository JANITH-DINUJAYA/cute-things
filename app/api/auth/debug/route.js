import { NextResponse } from 'next/server';
import { _adminInitialized } from '@/lib/firebase/admin';

/**
 * GET /api/auth/debug
 * Returns Firebase Admin SDK initialization status.
 * Helps diagnose Vercel environment variable issues.
 * Safe to expose — no secrets are returned.
 */
export async function GET() {
  try {
    const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    const status = {
      adminSdkInitialized: _adminInitialized,
      env: {
        FIREBASE_ADMIN_PROJECT_ID:   projectId   ? `✓ set (${projectId})` : '✗ MISSING',
        FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail ? `✓ set` : '✗ MISSING',
        FIREBASE_ADMIN_PRIVATE_KEY:  privateKey
          ? `✓ set (${privateKey.length} chars, starts: ${privateKey.slice(0, 15)}...)`
          : '✗ MISSING',
      },
      nodeEnv: process.env.NODE_ENV,
    };

    return NextResponse.json(status, { status: _adminInitialized ? 200 : 503 });
  } catch (err) {
    return NextResponse.json({
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
