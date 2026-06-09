const fs = require('fs');
const path = require('path');
const serviceAccount = require('../.env.local.json');

async function run() {
  try {
    const { cert } = require('firebase-admin/app');
    const cred = cert(serviceAccount);
    const tokenResult = await cred.getAccessToken();
    const token = tokenResult.access_token;
    const projectId = serviceAccount.project_id;
    
    // Fetch Web App Config
    let listUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`;
    let res = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to list web apps: ${res.statusText}`);
    }
    
    let data = await res.json();
    let apps = data.apps || [];
    if (apps.length === 0) {
      throw new Error('No web app found. Please run fetch-web-config.js first.');
    }
    
    let targetApp = apps[0];
    let configUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${targetApp.appId}/config`;
    let configRes = await fetch(configUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!configRes.ok) {
      throw new Error(`Failed to fetch config: ${configRes.statusText}`);
    }
    
    let config = await configRes.json();
    
    // Format private key for .env file - replace actual newlines with literal \n
    const formattedPrivateKey = serviceAccount.private_key.replace(/\n/g, '\\n');
    
    const envContent = `# ============================================================
# CUTE THINGS — Environment Variables (Auto-Generated)
# ============================================================

# ── Firebase CLIENT (safe to expose with NEXT_PUBLIC_ prefix) ──
NEXT_PUBLIC_FIREBASE_API_KEY=${config.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.storageBucket || 'cute-thing.firebasestorage.app'}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${config.appId}
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-12345678

# ── Firebase ADMIN (server-only — NEVER expose to client) ──
FIREBASE_ADMIN_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_ADMIN_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_ADMIN_PRIVATE_KEY="${formattedPrivateKey}"

# ── imgbb ──
IMGBB_API_KEY=

# ── Brevo Email ──
BREVO_API_KEY=
BREVO_FROM_EMAIL=noreply@cutethings.lk
BREVO_FROM_NAME="Cute Things"

# ── App ──
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── SuperAdmin Seed (used only in scripts/seed-superadmin.js) ──
SUPERADMIN_EMAIL=admin@cutethings.lk
SUPERADMIN_PASSWORD=admin12345
SUPERADMIN_DISPLAY_NAME="Cute Things SuperAdmin"
`;

    fs.writeFileSync(path.join(__dirname, '../.env.local'), envContent, 'utf8');
    console.log('✅ Successfully generated .env.local file with Firebase configuration!');
    
  } catch (err) {
    console.error('Error generating env file:', err);
  }
}

run();
