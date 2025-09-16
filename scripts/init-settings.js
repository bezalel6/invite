/**
 * Script to initialize Firebase settings with default values
 * Run with: npm run firebase:init-settings
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com';

async function initializeSettings() {
  try {
    console.log('🔧 Initializing Firebase settings...\n');
    
    // Read the settings template
    const settingsPath = join(__dirname, '..', 'firebase-settings-init.json');
    const settingsData = JSON.parse(readFileSync(settingsPath, 'utf8'));
    
    // Check if settings already exist
    console.log('📡 Checking existing settings...');
    const checkResponse = await fetch(`${FIREBASE_URL}/settings.json`);
    const existingSettings = await checkResponse.json();
    
    if (existingSettings) {
      console.log('⚠️  Settings already exist in Firebase!');
      console.log('   Current settings:', JSON.stringify(existingSettings, null, 2).substring(0, 200) + '...');
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('   Do you want to overwrite? (y/N): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Initialization cancelled');
        return;
      }
    }
    
    // Upload settings to Firebase
    console.log('📤 Uploading settings to Firebase...');
    const response = await fetch(`${FIREBASE_URL}/settings.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData.settings)
    });
    
    if (!response.ok) {
      throw new Error(`Firebase returned status ${response.status}`);
    }
    
    console.log('✅ Settings initialized successfully!');
    console.log('\n📋 Settings structure:');
    console.log('   - Default template with 8 fields');
    console.log('   - Protected fields: title, subtitle, event, footer');
    console.log('   - Theme colors configured');
    console.log('\n🔗 View in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/invites-75e19/database/invites-75e19-default-rtdb/data/~2Fsettings');
    
  } catch (error) {
    console.error('❌ Error initializing settings:', error.message);
    process.exit(1);
  }
}

initializeSettings();