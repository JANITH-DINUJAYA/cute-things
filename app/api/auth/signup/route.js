import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * POST /api/auth/signup
 * Initializes a new customer document in Firestore.
 * Body: { uid, name, email }
 */
export async function POST(request) {
  try {
    const { uid, name, email } = await request.json();

    if (!uid || !name || !email) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 });
    }

    const customerRef = adminDb.collection('customers').doc(uid);
    const docSnap = await customerRef.get();

    if (docSnap.exists) {
      return NextResponse.json({ success: true, message: 'Profile already exists' });
    }

    await customerRef.set({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: '',
      ordersCount: 0,
      totalSpent: 0,
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/auth/signup] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
