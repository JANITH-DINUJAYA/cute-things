const { initializeApp, cert } = require('firebase-admin/app');
const { getProjectManagement } = require('firebase-admin/project-management');
const serviceAccount = require('../.env.local.json');

initializeApp({
  credential: cert(serviceAccount)
});

async function run() {
  try {
    const pm = getProjectManagement();
    const webApps = await pm.listWebApps();
    console.log('--- FOUND WEB APPS ---');
    console.log(webApps);
    
    if (webApps.length > 0) {
      const config = await webApps[0].getConfig();
      console.log('--- CLIENT CONFIG ---');
      console.log(config);
    } else {
      console.log('No Web Apps found in this Firebase project. Creating one...');
      const webApp = await pm.createWebApp('cute-things-web', 'Cute Things Web');
      const config = await webApp.getConfig();
      console.log('--- CLIENT CONFIG (NEW) ---');
      console.log(config);
    }
  } catch (err) {
    console.error('Error fetching/creating Firebase Web App Config:', err);
  }
}
run();
