const { cert } = require('firebase-admin/app');
const serviceAccount = require('../.env.local.json');

async function run() {
  try {
    const cred = cert(serviceAccount);
    const tokenResult = await cred.getAccessToken();
    const token = tokenResult.access_token;
    const projectId = serviceAccount.project_id;
    
    console.log(`Using Firebase Project ID: ${projectId}`);
    
    // 1. List Web Apps
    let listUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`;
    let res = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to list web apps: ${res.statusText} - ${errText}`);
    }
    
    let data = await res.json();
    let apps = data.apps || [];
    let targetApp = null;
    
    if (apps.length > 0) {
      console.log(`Found ${apps.length} existing Web App(s).`);
      targetApp = apps[0];
    } else {
      console.log('No Web Apps found. Creating one...');
      let createUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`;
      let createRes = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: 'Cute Things Web App'
        })
      });
      
      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to create web app: ${createRes.statusText} - ${errText}`);
      }
      
      let createData = await createRes.json();
      console.log('Creation response:', createData);
      
      // Wait a moment for creation to propagate
      await new Promise(r => setTimeout(r, 2000));
      
      // List again
      let listRes2 = await fetch(listUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      let data2 = await listRes2.json();
      let apps2 = data2.apps || [];
      if (apps2.length === 0) {
        throw new Error('Web app created but still not appearing in list.');
      }
      targetApp = apps2[0];
    }
    
    console.log(`Using Web App ID: ${targetApp.appId}`);
    
    // 2. Get Config
    let configUrl = `https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps/${targetApp.appId}/config`;
    let configRes = await fetch(configUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!configRes.ok) {
      const errText = await configRes.text();
      throw new Error(`Failed to fetch web app config: ${configRes.statusText} - ${errText}`);
    }
    
    let configData = await configRes.json();
    console.log('\n--- FIREBASE CLIENT CONFIGURATION ---');
    console.log(JSON.stringify(configData, null, 2));
    console.log('-------------------------------------\n');
    
  } catch (err) {
    console.error('Error running script:', err);
  }
}

run();
