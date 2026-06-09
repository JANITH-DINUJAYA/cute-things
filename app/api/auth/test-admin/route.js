import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth }      from 'firebase-admin/auth';

export async function GET() {
  return NextResponse.json({ status: 'auth-ok' });
}
