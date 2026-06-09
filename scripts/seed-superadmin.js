/**
 * One-time SuperAdmin Seeder Script
 *
 * Run ONCE after Firebase project is configured:
 *   node scripts/seed-superadmin.js
 *
 * This creates the superadmin account in Firebase Auth,
 * sets the custom claim { role: 'superadmin' },
 * and writes the permanent user document to Firestore.
 *
 * ⚠️  Do NOT run this more than once unless you are
 *     resetting your project entirely.
 */

// Load env vars from .env.local
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth }      = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// ─── Init Admin SDK ───────────────────────────────────────────────────────────
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const auth = getAuth();
const db   = getFirestore();

// ─── Config from .env.local ───────────────────────────────────────────────────
const SUPERADMIN_EMAIL        = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD     = process.env.SUPERADMIN_PASSWORD;
const SUPERADMIN_DISPLAY_NAME = process.env.SUPERADMIN_DISPLAY_NAME || 'Super Admin';

async function seed() {
  if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
    console.error('❌ Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in .env.local');
    process.exit(1);
  }

  try {
    // ── Create or fetch user in Firebase Auth ─────────────────────────────────
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(SUPERADMIN_EMAIL);
      console.log(`⚠️  User already exists: ${SUPERADMIN_EMAIL}`);
    } catch {
      userRecord = await auth.createUser({
        email:        SUPERADMIN_EMAIL,
        password:     SUPERADMIN_PASSWORD,
        displayName:  SUPERADMIN_DISPLAY_NAME,
        emailVerified: true,
      });
      console.log(`✅ Created Firebase Auth user: ${SUPERADMIN_EMAIL}`);
    }

    const uid = userRecord.uid;

    // ── Set Custom Claims ─────────────────────────────────────────────────────
    await auth.setCustomUserClaims(uid, { role: 'superadmin' });
    console.log(`✅ Set custom claim { role: 'superadmin' } on uid: ${uid}`);

    // ── Write Firestore document ──────────────────────────────────────────────
    await db.collection('users').doc(uid).set(
      {
        email:       SUPERADMIN_EMAIL,
        displayName: SUPERADMIN_DISPLAY_NAME,
        role:        'superadmin',
        isPermanent: true,
        permissions: {
          manageProducts:   true,
          manageOrders:     true,
          manageCustomers:  true,
          manageCategories: true,
          manageUsers:      true,
          viewReports:      true,
          manageSettings:   true,
          manageMarketing:  true,
        },
        createdAt:   new Date(),
        lastLoginAt: null,
      },
      { merge: true }
    );
    console.log(`✅ Firestore users/${uid} document written`);

    console.log('\n🎉 SuperAdmin seeded successfully!');
    console.log(`   Email: ${SUPERADMIN_EMAIL}`);
    console.log(`   UID:   ${uid}`);
    console.log('\n   Login at: /auth/login');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding superadmin:', err);
    process.exit(1);
  }
}

seed();
