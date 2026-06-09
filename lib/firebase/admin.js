import 'server-only';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth }      from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage }   from 'firebase-admin/storage';

// ── Mock helpers ─────────────────────────────────────────────────────────────
function makeMockDb() {
  return {
    collection: () => ({
      doc: () => ({
        set:    async () => {},
        get:    async () => ({ exists: false, data: () => null }),
        update: async () => {},
        delete: async () => {},
      }),
      get:     async () => ({ docs: [], empty: true, size: 0 }),
      where:   () => ({
        limit: () => ({ get: async () => ({ docs: [], empty: true, size: 0 }) }),
        get:   async () => ({ docs: [], empty: true, size: 0 }),
      }),
      orderBy: () => ({
        get:   async () => ({ docs: [], empty: true, size: 0 }),
        limit: () => ({ get: async () => ({ docs: [], empty: true, size: 0 }) }),
      }),
      add: async () => ({ id: 'mock-id' }),
    }),
    batch: () => ({
      set:    () => {},
      update: () => {},
      delete: () => {},
      commit: async () => {},
    }),
  };
}

function makeMockAuth() {
  return {
    verifyIdToken:      async () => { throw new Error('Firebase Admin SDK not initialized'); },
    createUser:         async () => ({ uid: 'dummy' }),
    setCustomUserClaims: async () => {},
    getUser:            async () => ({ uid: 'dummy', customClaims: {} }),
    deleteUser:         async () => {},
  };
}

// ── Initialization ────────────────────────────────────────────────────────────
let adminAuth;
let adminDb;
let adminStorage;
let _adminInitialized = false;

function parsePrivateKey(raw) {
  if (!raw) return null;
  let key = raw.trim();
  // Strip surrounding quotes (single or double)
  if ((key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  // Replace escaped newlines
  key = key.replace(/\\n/g, '\n');
  return key;
}

try {
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey  = parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (projectId && clientEmail && privateKey) {
    let adminApp;
    if (getApps().length > 0) {
      adminApp = getApps()[0];
    } else {
      adminApp = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }

    adminAuth    = getAuth(adminApp);
    adminDb      = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
    _adminInitialized = true;
    console.log('[admin] Firebase Admin SDK initialized ✓ project:', projectId);
  } else {
    const missing = [];
    if (!projectId)   missing.push('FIREBASE_ADMIN_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
    if (!privateKey)  missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
    console.warn('[admin] Firebase Admin SDK NOT initialized — missing env vars:', missing.join(', '));
    adminAuth    = makeMockAuth();
    adminDb      = makeMockDb();
    adminStorage = {};
  }
} catch (err) {
  console.error('[admin] Firebase Admin SDK initialization FAILED:', err.message);
  adminAuth    = makeMockAuth();
  adminDb      = makeMockDb();
  adminStorage = {};
}

export { adminAuth, adminDb, adminStorage, _adminInitialized };
