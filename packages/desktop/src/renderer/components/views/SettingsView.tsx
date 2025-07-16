import React, { useState, useEffect } from 'react';
import CollapsibleSection from '../CollapsibleSection';
// Temporarily removed UI imports to debug
// import { Button } from '../../../components/ui/button';
// import { Input } from '../../../components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface OverlaySettings {
  layoutMode: 'grid' | 'compact' | 'vertical' | 'horizontal';
  gridCols: number;
  gridRows: number;
  nodeWidth: number;
  nodeHeight: number;
  nodeStyle: 'rounded' | 'square' | 'minimal';
  animationSpeed: 'instant' | 'fast' | 'normal' | 'slow';
  theme: 'light' | 'dark' | 'auto';
  preloadContent: boolean;
  starterChainLimit: number;
  showPreviews: boolean;
  enableChainLinks: boolean;
}

interface Settings {
  theme: string;
  autoPaste: boolean;
  autoFormat: boolean;
  maxHistory: number;
  edgeHover: {
    enabled: boolean;
    position: string;
    delay: number;
    triggerSize: number;
  };
  overlay: OverlaySettings;
}

const SettingsView: React.FC = () => {
  console.log('🔧 SettingsView component initialized');
  console.log('🔧 SettingsView function called at:', new Date().toISOString());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for form values
  const [autoStart, setAutoStart] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [shortcutKey, setShortcutKey] = useState('Ctrl+Shift+V');
  
  // Overlay settings
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>({
    layoutMode: 'grid',
    gridCols: 2,
    gridRows: 3,
    nodeWidth: 180,
    nodeHeight: 90,
    nodeStyle: 'rounded',
    animationSpeed: 'fast',
    theme: 'dark',
    preloadContent: true,
    starterChainLimit: 6,
    showPreviews: true,
    enableChainLinks: true,
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
            layoutMode: loadedSettings.overlay.layoutMode || 'grid',
            gridCols: loadedSettings.overlay.gridCols || 2,
            gridRows: loadedSettings.overlay.gridRows || 3,
            nodeWidth: loadedSettings.overlay.nodeWidth || 180,
            nodeHeight: loadedSettings.overlay.nodeHeight || 90,
            nodeStyle: loadedSettings.overlay.nodeStyle || 'rounded',
            animationSpeed: loadedSettings.overlay.animationSpeed || 'fast',
            theme: loadedSettings.overlay.theme || 'dark',
            preloadContent: loadedSettings.overlay.preloadContent ?? true,
            starterChainLimit: loadedSettings.overlay.starterChainLimit || 6,
            showPreviews: loadedSettings.overlay.showPreviews ?? true,
            enableChainLinks: loadedSettings.overlay.enableChainLinks ?? true,
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
      
      const newSettings = {
        theme,
        autoPaste: settings?.autoPaste ?? false,
        autoFormat: settings?.autoFormat ?? false,
        maxHistory: settings?.maxHistory ?? 100,
        edgeHover,
        overlay: overlaySettings,
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
  
  return (
    <div className="view-container">
      <div style={{ 
        background: 'red', 
        color: 'white', 
        padding: '20px', 
        fontSize: '24px', 
        textAlign: 'center' as const,
        border: '3px solid yellow',
        margin: '20px 0'
      }}>
        🚨 SETTINGS VIEW IS RENDERING 🚨
      </div>
      <h2>Settings & Debug - LOADED</h2>
      
      <CollapsibleSection 
        title="General Settings" 
        icon="⚙️"
        defaultExpanded={true}
      >
        <div className="settings-section">
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
      </CollapsibleSection>

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
        title="Overlay UI Settings" 
        icon="🎨"
        defaultExpanded={true}
      >
        <div className="settings-section">
          <div className="setting-item">
            <label>Layout Mode:</label>
            <select 
              value={overlaySettings.layoutMode} 
              onChange={(e) => setOverlaySettings({...overlaySettings, layoutMode: e.target.value as any})}
            >
              <option value="grid">Grid</option>
              <option value="compact">Compact</option>
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>
          
          {overlaySettings.layoutMode === 'grid' && (
            <>
              <div className="setting-item">
                <label>Grid Columns:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={overlaySettings.gridCols} 
                  onChange={(e) => setOverlaySettings({...overlaySettings, gridCols: parseInt(e.target.value) || 2})}
                />
              </div>
              <div className="setting-item">
                <label>Grid Rows:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={overlaySettings.gridRows} 
                  onChange={(e) => setOverlaySettings({...overlaySettings, gridRows: parseInt(e.target.value) || 3})}
                />
              </div>
            </>
          )}
          
          <div className="setting-item">
            <label>Node Width:</label>
            <input 
              type="number" 
              min="120" 
              max="300" 
              value={overlaySettings.nodeWidth} 
              onChange={(e) => setOverlaySettings({...overlaySettings, nodeWidth: parseInt(e.target.value) || 180})}
            />
          </div>
          
          <div className="setting-item">
            <label>Node Height:</label>
            <input 
              type="number" 
              min="60" 
              max="150" 
              value={overlaySettings.nodeHeight} 
              onChange={(e) => setOverlaySettings({...overlaySettings, nodeHeight: parseInt(e.target.value) || 90})}
            />
          </div>
          
          <div className="setting-item">
            <label>Node Style:</label>
            <select 
              value={overlaySettings.nodeStyle} 
              onChange={(e) => setOverlaySettings({...overlaySettings, nodeStyle: e.target.value as any})}
            >
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Animation Speed:</label>
            <select 
              value={overlaySettings.animationSpeed} 
              onChange={(e) => setOverlaySettings({...overlaySettings, animationSpeed: e.target.value as any})}
            >
              <option value="instant">Instant</option>
              <option value="fast">Fast</option>
              <option value="normal">Normal</option>
              <option value="slow">Slow</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Overlay Theme:</label>
            <select 
              value={overlaySettings.theme} 
              onChange={(e) => setOverlaySettings({...overlaySettings, theme: e.target.value as any})}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div className="setting-item">
            <label>Starter Chain Limit:</label>
            <input 
              type="number" 
              min="3" 
              max="12" 
              value={overlaySettings.starterChainLimit} 
              onChange={(e) => setOverlaySettings({...overlaySettings, starterChainLimit: parseInt(e.target.value) || 6})}
            />
          </div>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={overlaySettings.preloadContent} 
                onChange={(e) => setOverlaySettings({...overlaySettings, preloadContent: e.target.checked})}
              />
              Preload Content
            </label>
          </div>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={overlaySettings.showPreviews} 
                onChange={(e) => setOverlaySettings({...overlaySettings, showPreviews: e.target.checked})}
              />
              Show Chain Previews
            </label>
          </div>
          
          <div className="setting-item">
            <label>
              <input 
                type="checkbox" 
                checked={overlaySettings.enableChainLinks} 
                onChange={(e) => setOverlaySettings({...overlaySettings, enableChainLinks: e.target.checked})}
              />
              Enable Chain Links
            </label>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection 
        title="Edge Hover Settings" 
        icon="🎯"
        defaultExpanded={false}
      >
        <div className="settings-section">
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
      
      {/* Save Settings Section */}
      <div className="settings-section" style={{ marginTop: '20px', padding: '20px', border: '1px solid #444', borderRadius: '8px' }}>
        <div className="setting-item">
          <button 
            className="button button-primary" 
            onClick={saveSettings}
            disabled={saving}
            style={{ marginRight: '10px' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button 
            className="button button-secondary" 
            onClick={loadSettings}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Reload Settings'}
          </button>
        </div>
        
        {error && (
          <div className="error-message" style={{ color: '#ff6b6b', marginTop: '10px' }}>
            {error}
          </div>
        )}
        
        {saving && (
          <div className="success-message" style={{ color: '#51cf66', marginTop: '10px' }}>
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
