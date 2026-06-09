import { NextResponse } from 'next/server';

export async function GET() {
  const steps = [];
  try {
    steps.push('Importing firebase-admin/app');
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    steps.push('Imported firebase-admin/app successfully');

    steps.push('Importing firebase-admin/auth');
    const { getAuth } = await import('firebase-admin/auth');
    steps.push('Imported firebase-admin/auth successfully');

    steps.push('Importing firebase-admin/firestore');
    const { getFirestore } = await import('firebase-admin/firestore');
    steps.push('Imported firebase-admin/firestore successfully');

    steps.push('Importing firebase-admin/storage');
    const { getStorage } = await import('firebase-admin/storage');
    steps.push('Imported firebase-admin/storage successfully');

    return NextResponse.json({
      status: 'ok',
      steps,
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      failedStep: steps[steps.length - 1],
      error: err.message,
      stack: err.stack,
      steps,
    }, { status: 500 });
  }
}
