import React, { useState, useEffect } from 'react';
import CollapsibleSection from '../CollapsibleSection';
import OverlayNodePreview from '../../../components/OverlayNodePreview';

import { Settings, OverlaySettings } from '../../../types';

// Extended overlay settings for UI controls
interface ExtendedOverlaySettings extends OverlaySettings {
  starterChainLimit?: number;
  showPreviews?: boolean;
  enableChainLinks?: boolean;
  layoutMode?: 'grid' | 'compact' | 'vertical' | 'horizontal';
}

const SettingsView: React.FC = () => {
  console.log('🔧 SettingsView component initialized');
  console.log('🔧 SettingsView function called at:', new Date().toISOString());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state - moved up to be available throughout component
  const [activeTab, setActiveTab] = useState<'general' | 'overlay' | 'edge' | 'advanced'>('overlay'); // Default to overlay to show preview

  // Local state for form values
  const [autoStart, setAutoStart] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [shortcutKey, setShortcutKey] = useState('Ctrl+Shift+V');
  
  // Overlay settings
  const [overlaySettings, setOverlaySettings] = useState<ExtendedOverlaySettings>({
    theme: 'dark',
    opacity: 0.98,
    blur: 10,
    gridCols: 2,
    gridRows: 3,
    nodeWidth: 180,
    nodeHeight: 90,
    nodeStyle: 'rounded',
    animationSpeed: 'fast',
    preloadContent: true,
    starterChainLimit: 6,
    showPreviews: true,
    enableChainLinks: true,
    layoutMode: 'grid',
  });
  
  // Edge hover settings
  const [edgeHover, setEdgeHover] = useState({
    enabled: true,
    position: 'left-center',
    delay: 662,
    triggerSize: 50, // Increased from 20 to 50 for better usability
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const loadedSettings = await window.api.invoke('get-settings');
      
      if (loadedSettings) {
        setSettings(loadedSettings);
        setTheme(loadedSettings.theme || 'dark');
        
        // Load edge hover settings
        if (loadedSettings.edgeHover) {
          setEdgeHover({
            enabled: loadedSettings.edgeHover.enabled ?? true,
            position: loadedSettings.edgeHover.position || 'left-center',
            delay: loadedSettings.edgeHover.delay || 662,
            triggerSize: loadedSettings.edgeHover.triggerSize || 50,
          });
        }
        
        // Load overlay settings
        if (loadedSettings.overlay) {
          setOverlaySettings({
            theme: loadedSettings.overlay.theme || 'dark',
            opacity: loadedSettings.overlay.opacity || 0.98,
            blur: loadedSettings.overlay.blur || 10,
            gridCols: loadedSettings.overlay.gridCols || 2,
            gridRows: loadedSettings.overlay.gridRows || 3,
            nodeWidth: loadedSettings.overlay.nodeWidth || 180,
            nodeHeight: loadedSettings.overlay.nodeHeight || 90,
            nodeStyle: loadedSettings.overlay.nodeStyle || 'rounded',
            animationSpeed: loadedSettings.overlay.animationSpeed || 'fast',
            preloadContent: loadedSettings.overlay.preloadContent ?? true,
            starterChainLimit: 6,
            showPreviews: true,
            enableChainLinks: true,
            layoutMode: 'grid',
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const newSettings: Settings = {
        theme: theme as 'light' | 'dark' | 'system',
        autoPaste: settings?.autoPaste ?? false,
        autoFormat: settings?.autoFormat ?? false,
        maxHistory: settings?.maxHistory ?? 100,
        edgeHover,
        overlay: {
          theme: overlaySettings.theme,
          opacity: overlaySettings.opacity || 0.98,
          blur: overlaySettings.blur || 10,
          gridCols: overlaySettings.gridCols || 2,
          gridRows: overlaySettings.gridRows || 3,
          nodeWidth: overlaySettings.nodeWidth || 180,
          nodeHeight: overlaySettings.nodeHeight || 90,
          nodeStyle: overlaySettings.nodeStyle || 'rounded',
          nodeGap: overlaySettings.nodeGap || 8,
          nodeRadius: overlaySettings.nodeRadius || 12,
          animationSpeed: overlaySettings.animationSpeed || 'fast',
          preloadContent: overlaySettings.preloadContent ?? true
        },
      };
      
      console.log('🔧 Saving settings:', JSON.stringify(newSettings, null, 2));
      const result = await window.api.invoke('save-settings', newSettings);
      console.log('🔧 Save settings result:', result);
      
      if (result.success) {
        setSettings(newSettings);
        // Show success message with visual feedback
        console.log('✅ Settings saved successfully!');
        // Add a temporary success state
        setTimeout(() => setSaving(false), 2000);
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportDiagnostics = () => {
    window.api.invoke('export-diagnostics')
      .then(() => console.log('Diagnostics exported'))
      .catch(err => console.error('Error exporting diagnostics:', err));
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cached data?')) {
      console.log('Clearing cache...');
      // Add actual cache clearing logic here
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      console.log('Resetting settings...');
      // Add actual reset logic here
    }
  };

  console.log('SettingsView render - loading:', loading);
  
  if (loading) {
    return (
      <div className="view-container">
        <h2>Settings & Debug - LOADING</h2>
        <div className="text-center p-8">
          <div className="loading-spinner mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  console.log('SettingsView render - loaded successfully');
  
  const handleSettingChange = (key: string, value: any) => {
    if (key.startsWith('overlay.')) {
      const overlayKey = key.replace('overlay.', '');
      setOverlaySettings(prev => ({ ...prev, [overlayKey]: value }));
    }
  };
  
  return (
    <div className="view-container" style={{
      background: 'rgba(20, 20, 20, 0.98)',
      borderRadius: '12px',
      padding: '20px',
      minHeight: '100%',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      color: '#e0e0e0'
    }}>
      <h2 style={{ color: '#4a90e2', marginBottom: '20px' }}>Settings & Debug</h2>
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '8px'
      }}>
        <button
          onClick={() => setActiveTab('general')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'general' ? '#4a90e2' : 'rgba(30, 30, 30, 0.8)',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            color: '#e0e0e0',
            cursor: 'pointer',
            fontWeight: activeTab === 'general' ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          ⚙️ General
        </button>
        <button
          onClick={() => setActiveTab('overlay')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'overlay' ? '#4a90e2' : 'rgba(30, 30, 30, 0.8)',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            color: '#e0e0e0',
            cursor: 'pointer',
            fontWeight: activeTab === 'overlay' ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          🎨 Overlay Design
        </button>
        <button
          onClick={() => setActiveTab('edge')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'edge' ? '#4a90e2' : 'rgba(30, 30, 30, 0.8)',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            color: '#e0e0e0',
            cursor: 'pointer',
            fontWeight: activeTab === 'edge' ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          🖱️ Edge Hover
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          style={{
            padding: '8px 16px',
            background: activeTab === 'advanced' ? '#4a90e2' : 'rgba(30, 30, 30, 0.8)',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            color: '#e0e0e0',
            cursor: 'pointer',
            fontWeight: activeTab === 'advanced' ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          🔧 Advanced
        </button>
      </div>
      
      {/* Tab Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '8px'
      }}>
      
      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="settings-section" style={{
          background: 'rgba(30, 30, 30, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={autoStart} 
                onChange={(e) => setAutoStart(e.target.checked)}
              />
              Start SnipFlow on system startup
            </label>
          </div>
          <div className="setting-item">
            <label>Theme:</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Global Shortcut:</label>
            <input 
              type="text" 
              value={shortcutKey} 
              onChange={(e) => setShortcutKey(e.target.value)}
              placeholder="e.g., Ctrl+Shift+V"
            />
          </div>
        </div>
      )}
      
      {/* Overlay Design Tab */}
      {activeTab === 'overlay' && (
        <div>
          {/* Node Preview Component */}
          <OverlayNodePreview 
            settings={{
              theme: (settings?.theme || 'dark') as 'light' | 'dark' | 'system',
              autoPaste: settings?.autoPaste || false,
              autoFormat: settings?.autoFormat || false,
              maxHistory: settings?.maxHistory || 100,
              edgeHover: edgeHover,
              overlay: {
                theme: overlaySettings.theme,
                opacity: overlaySettings.opacity || 0.98,
                blur: overlaySettings.blur || 10,
                gridCols: overlaySettings.gridCols || 2,
                gridRows: overlaySettings.gridRows || 3,
                nodeWidth: overlaySettings.nodeWidth || 180,
                nodeHeight: overlaySettings.nodeHeight || 90,
                nodeStyle: overlaySettings.nodeStyle || 'rounded',
                nodeGap: overlaySettings.nodeGap || 8,
                nodeRadius: overlaySettings.nodeRadius || 12,
                animationSpeed: overlaySettings.animationSpeed || 'fast',
                preloadContent: overlaySettings.preloadContent ?? true
              }
            }}
            onSettingChange={handleSettingChange}
          />
        </div>
      )}
      
      {/* Edge Hover Tab */}
      {activeTab === 'edge' && (
        <div className="settings-section" style={{
          background: 'rgba(30, 30, 30, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <h3 style={{ color: '#4a90e2', marginBottom: '16px' }}>Edge Hover Settings</h3>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={edgeHover.enabled} 
                onChange={(e) => setEdgeHover({...edgeHover, enabled: e.target.checked})}
              />
              Enable Edge Hover
            </label>
          </div>
          
          {/* Test button to manually show overlay */}
          <div className="setting-item">
            <button 
              className="button button-secondary" 
              onClick={() => {
                console.log('🔧 Testing overlay show...');
                window.api.send('test-show-overlay');
              }}
              style={{ marginBottom: '10px' }}
            >
              Test Show Overlay
            </button>
          </div>
          
          <div className="setting-item">
            <label>Edge Position:</label>
            <select 
              value={edgeHover.position} 
              onChange={(e) => setEdgeHover({...edgeHover, position: e.target.value})}
            >
              <option value="left-center">Left Center</option>
              <option value="right-center">Right Center</option>
              <option value="top-center">Top Center</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Hover Delay (ms):</label>
            <input 
              type="number" 
              min="0" 
              max="2000" 
              value={edgeHover.delay} 
              onChange={(e) => setEdgeHover({...edgeHover, delay: parseInt(e.target.value) || 662})}
            />
          </div>
          
          <div className="setting-item">
            <label>Hover Area Size:</label>
            <input 
              type="number" 
              min="5" 
              max="100" 
              value={edgeHover.triggerSize} 
              onChange={(e) => setEdgeHover({...edgeHover, triggerSize: parseInt(e.target.value) || 50})}
            />
          </div>
        </div>
      )}
      
      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div>
          <div className="settings-section" style={{
            background: 'rgba(30, 30, 30, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h3 style={{ color: '#4a90e2', marginBottom: '16px' }}>Advanced Settings</h3>
            
            <div className="setting-item">
              <label>
                <input 
                  type="checkbox" 
                  checked={edgeHover.enabled} 
                  onChange={(e) => setEdgeHover({...edgeHover, enabled: e.target.checked})}
                />
                Enable Edge Hover
              </label>
            </div>
            
            {/* Test button to manually show overlay */}
            <div className="setting-item">
              <button 
                className="button button-secondary" 
                onClick={() => {
                  console.log('🔧 Testing overlay show...');
                  window.api.send('test-show-overlay');
                }}
                style={{ marginBottom: '10px' }}
              >
                Test Show Overlay
              </button>
            </div>
            
            <div className="setting-item">
              <label>Edge Position:</label>
              <select 
                value={edgeHover.position} 
                onChange={(e) => setEdgeHover({...edgeHover, position: e.target.value})}
              >
                <option value="left-center">Left Center</option>
                <option value="right-center">Right Center</option>
                <option value="top-center">Top Center</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label>Hover Delay (ms):</label>
              <input 
                type="number" 
                min="0" 
                max="2000" 
                value={edgeHover.delay} 
                onChange={(e) => setEdgeHover({...edgeHover, delay: parseInt(e.target.value) || 662})}
              />
            </div>
            
            <div className="setting-item">
              <label>Hover Area Size:</label>
              <input 
                type="number" 
                min="5" 
                max="100" 
                value={edgeHover.triggerSize} 
                onChange={(e) => setEdgeHover({...edgeHover, triggerSize: parseInt(e.target.value) || 50})}
              />
            </div>
          </div>
          
          <CollapsibleSection 
            title="Diagnostics & Debug" 
            icon="🔧"
            defaultExpanded={false}
          >
            <div className="settings-section">
              <button className="button button-primary" onClick={handleExportDiagnostics}>
                Export Diagnostics
              </button>
              <button className="button button-secondary" onClick={handleClearCache}>
                Clear Cache
              </button>
              <button className="button button-danger" onClick={handleResetSettings}>
                Reset All Settings
              </button>
              <div className="setting-item">
                <p className="settings-info">
                  Version: 0.1.0<br/>
                  Electron: {process.versions.electron}<br/>
                  Node: {process.versions.node}<br/>
                  Chrome: {process.versions.chrome}
                </p>
              </div>
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection 
            title="Data Management" 
            icon="💾"
            defaultExpanded={false}
          >
            <div className="settings-section">
              <div className="setting-item">
                <button className="button button-secondary">
                  Export All Data
                </button>
              </div>
              <div className="setting-item">
                <button className="button button-secondary">
                  Import Data
                </button>
              </div>
              <div className="setting-item">
                <button className="button button-danger">
                  Clear All Snippets
                </button>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
      </div>
      
      {/* Save Settings Bar - Always visible */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(30, 30, 30, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="button button-primary" 
            onClick={saveSettings}
            disabled={saving}
            style={{
              padding: '8px 20px',
              background: saving ? '#2d5a8e' : '#4a90e2',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button 
            className="button button-secondary" 
            onClick={loadSettings}
            disabled={loading}
            style={{
              padding: '8px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: '#e0e0e0',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Loading...' : 'Reload Settings'}
          </button>
        </div>
        
        <div style={{ flex: 1, marginLeft: '20px' }}>
          {error && (
            <div style={{ color: '#ff6b6b' }}>
              ⚠️ {error}
            </div>
          )}
          
          {saving && !error && (
            <div style={{ color: '#51cf66' }}>
              ✅ Settings saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
