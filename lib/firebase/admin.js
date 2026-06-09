import 'server-only';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth }      from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage }   from 'firebase-admin/storage';

let adminAuth;
let adminDb;
let adminStorage;

try {
  if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
    const adminApp = getApps().length > 0 ? getApps()[0] : initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    adminStorage = getStorage(adminApp);
  } else {
    // Mock implementations for build time / static generation
    adminAuth = {
      verifyIdToken: async () => ({ role: 'guest' }),
      createUser: async () => ({ uid: 'dummy' }),
      setCustomUserClaims: async () => {},
    };
    adminDb = {
      collection: () => ({
        doc: () => ({
          set: async () => {},
          get: async () => ({ exists: false, data: () => null }),
        }),
      }),
    };
    adminStorage = {};
  }
} catch (err) {
  console.warn('Firebase Admin SDK failed to initialize. Using mock services.', err.message);
  adminAuth = {
    verifyIdToken: async () => ({ role: 'guest' }),
    createUser: async () => ({ uid: 'dummy' }),
    setCustomUserClaims: async () => {},
  };
  adminDb = {
    collection: () => ({
      doc: () => ({
        set: async () => {},
        get: async () => ({ exists: false, data: () => null }),
      }),
    }),
  };
  adminStorage = {};
}

export { adminAuth, adminDb, adminStorage };
