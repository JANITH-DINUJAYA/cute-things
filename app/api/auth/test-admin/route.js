import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export async function GET() {
  try {
    const apps = getApps();
    return NextResponse.json({
      status: 'ok',
      appsCount: apps.length,
      hasCert: typeof cert === 'function',
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
