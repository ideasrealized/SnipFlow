// Script to fix overlay settings in the database
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

// Database path (same as in the app)
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Electron', '.snipflow', 'snippets.db');

console.log('Fixing overlay settings...');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check current settings
  const currentSettings = db.prepare("SELECT value FROM settings WHERE key = 'edgeHover'").get();
  console.log('Current edgeHover settings:', currentSettings?.value);
  
  const currentOverlay = db.prepare("SELECT value FROM settings WHERE key = 'overlay'").get();
  console.log('Current overlay settings:', currentOverlay?.value);
  
  // Update edge hover to left-center
  const newEdgeHover = JSON.stringify({
    enabled: true,
    position: 'left-center',
    triggerSize: 20,
    delay: 200
  });
  
  // Update overlay to left side
  const newOverlay = JSON.stringify({
    theme: 'dark',
    opacity: 0.95,
    blur: 5,
    y: 50,
    side: 'left'
  });
  
  // Update the settings
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('edgeHover', newEdgeHover);
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('overlay', newOverlay);
  
  console.log('✅ Updated edgeHover to left-center');
  console.log('✅ Updated overlay to left side');
  
  // Verify the changes
  const updatedEdgeHover = db.prepare("SELECT value FROM settings WHERE key = 'edgeHover'").get();
  const updatedOverlay = db.prepare("SELECT value FROM settings WHERE key = 'overlay'").get();
  
  console.log('New edgeHover settings:', updatedEdgeHover?.value);
  console.log('New overlay settings:', updatedOverlay?.value);
  
  db.close();
  console.log('✅ Database updated successfully!');
  
} catch (error) {
  console.error('❌ Error updating database:', error);
} 