// Force update settings using the app's own database module
import { initProductionDb, updateSettings, getSettings, closeDb } from './dist/db.js';

console.log('Force updating settings to left-center...');

try {
  // Initialize the database
  await initProductionDb();
  console.log('✅ Database initialized');
  
  // Get current settings
  const currentSettings = getSettings();
  console.log('Current edgeHover position:', currentSettings.edgeHover.position);
  console.log('Current overlay side:', currentSettings.overlay.side);
  
  // Force update to left-center
  const newSettings = {
    edgeHover: {
      ...currentSettings.edgeHover,
      position: 'left-center'
    },
    overlay: {
      ...currentSettings.overlay,
      side: 'left'
    }
  };
  
  updateSettings(newSettings);
  console.log('✅ Settings updated');
  
  // Verify the changes
  const updatedSettings = getSettings();
  console.log('New edgeHover position:', updatedSettings.edgeHover.position);
  console.log('New overlay side:', updatedSettings.overlay.side);
  
  closeDb();
  console.log('✅ Settings force updated successfully!');
  
} catch (error) {
  console.error('❌ Error force updating settings:', error);
} 