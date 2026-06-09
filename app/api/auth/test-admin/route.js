import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth }      from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage }   from 'firebase-admin/storage';

export async function GET() {
  try {
    const apps = getApps();
    return NextResponse.json({
      status: 'ok',
      appsCount: apps.length,
      hasCert: typeof cert === 'function',
      hasAuth: typeof getAuth === 'function',
      hasFirestore: typeof getFirestore === 'function',
      hasStorage: typeof getStorage === 'function',
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
