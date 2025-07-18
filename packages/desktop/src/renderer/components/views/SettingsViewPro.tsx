import React, { useState, useEffect } from 'react';
import { Settings } from '../../../types';

// Icon components with proper styling
const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const PaintIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const KeyboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const MouseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const SettingsViewPro: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overlay' | 'edge' | 'shortcuts' | 'general'>('overlay');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await window.api.getSettings();
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      await window.api.saveSettings(settings);
      setOriginalSettings(settings);
      setHasUnsavedChanges(false);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('Failed to save settings');
    }
  };

  const updateSetting = <K extends keyof Settings>(category: K, key: keyof Settings[K], value: any) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      [category]: {
        ...(settings[category] as any),
        [key]: value
      }
    };
    
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const resetToDefaults = () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return;
    
    const defaultSettings: Settings = {
      theme: 'dark',
      autoPaste: true,
      autoFormat: true,
      maxHistory: 100,
      overlay: {
        gridCols: 3,
        gridRows: 3,
        nodeWidth: 200,
        nodeHeight: 80,
        animationSpeed: 'normal',
        theme: 'dark',
        nodeStyle: 'rounded',
        nodeGap: 16,
        nodeRadius: 12,
        opacity: 95,
        blur: 10
      },
      edgeHover: {
        enabled: true,
        position: 'left-center',
        triggerSize: 40,
        delay: 300
      }
    };
    
    setSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  if (!settings) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: '#888' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderOverlaySettings = () => (
    <div className="space-y-8">
      {/* Grid Layout Section */}
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3" style={{ color: '#fff' }}>
          <GridIcon />
          Grid Layout
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Columns</label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.overlay.gridCols}
              onChange={(e) => updateSetting('overlay', 'gridCols', parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: '#4a90e2' }}
            />
            <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.overlay.gridCols}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Rows</label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.overlay.gridRows}
              onChange={(e) => updateSetting('overlay', 'gridRows', parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: '#4a90e2' }}
            />
            <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.overlay.gridRows}</div>
          </div>
        </div>
      </div>

      {/* Node Appearance Section */}
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3" style={{ color: '#fff' }}>
          <PaintIcon />
          Node Appearance
        </h2>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Width</label>
            <input
              type="range"
              min="100"
              max="300"
              value={settings.overlay.nodeWidth}
              onChange={(e) => updateSetting('overlay', 'nodeWidth', parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: '#4a90e2' }}
            />
            <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.overlay.nodeWidth}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Height</label>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.overlay.nodeHeight}
              onChange={(e) => updateSetting('overlay', 'nodeHeight', parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: '#4a90e2' }}
            />
            <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.overlay.nodeHeight}px</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Node Style</label>
            <select
              value={settings.overlay.nodeStyle || 'rounded'}
              onChange={(e) => updateSetting('overlay', 'nodeStyle', e.target.value as any)}
              style={{ 
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="hexagon">Hexagon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Animation Speed</label>
            <select
              value={settings.overlay.animationSpeed}
              onChange={(e) => updateSetting('overlay', 'animationSpeed', e.target.value as any)}
              style={{ 
                width: '100%',
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <option value="instant">Instant</option>
              <option value="fast">Fast</option>
              <option value="normal">Normal</option>
              <option value="slow">Slow</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Gap</label>
            <input
              type="range"
              min="0"
              max="32"
              value={settings.overlay.nodeGap || 16}
              onChange={(e) => updateSetting('overlay', 'nodeGap', parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: '#4a90e2' }}
            />
            <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.overlay.nodeGap || 16}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Border Radius</label>
            <input
              type="range"
              min="0"
              max="24"
              value={settings.overlay.nodeRadius || 12}
              onChange={(e) => updateSetting('overlay', 'nodeRadius', parseInt(e.target.value))}
              className="w-full"
              disabled={settings.overlay.nodeStyle !== 'rounded'}
              style={{ accentColor: '#4a90e2' }}
            />
            <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.overlay.nodeRadius || 12}px</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEdgeSettings = () => (
    <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
      <h2 className="text-xl font-semibold mb-6" style={{ color: '#fff' }}>Edge Hover Settings</h2>
      
      <div className="space-y-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.edgeHover.enabled}
            onChange={(e) => updateSetting('edgeHover', 'enabled', e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#4a90e2' }}
          />
          <span style={{ color: '#aaa', fontSize: '16px' }}>Enable Edge Hover</span>
        </label>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Hover Position</label>
          <select
            value={settings.edgeHover.position}
            onChange={(e) => updateSetting('edgeHover', 'position', e.target.value)}
            disabled={!settings.edgeHover.enabled}
            style={{ 
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              opacity: settings.edgeHover.enabled ? 1 : 0.5
            }}
          >
            <option value="left-center">Left Center</option>
            <option value="right-center">Right Center</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Trigger Size (px)</label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.edgeHover.triggerSize}
            onChange={(e) => updateSetting('edgeHover', 'triggerSize', parseInt(e.target.value))}
            disabled={!settings.edgeHover.enabled}
            className="w-full"
            style={{ accentColor: '#4a90e2', opacity: settings.edgeHover.enabled ? 1 : 0.5 }}
          />
          <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.edgeHover.triggerSize}px</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#aaa' }}>Trigger Delay (ms)</label>
          <input
            type="range"
            min="0"
            max="2000"
            step="100"
            value={settings.edgeHover.delay}
            onChange={(e) => updateSetting('edgeHover', 'delay', parseInt(e.target.value))}
            disabled={!settings.edgeHover.enabled}
            className="w-full"
            style={{ accentColor: '#4a90e2', opacity: settings.edgeHover.enabled ? 1 : 0.5 }}
          />
          <div className="text-center text-sm mt-2" style={{ color: '#666' }}>{settings.edgeHover.delay}ms</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0f0f0f', color: '#fff' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333', padding: '16px 24px' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            {hasUnsavedChanges && (
              <p className="text-sm mt-1" style={{ color: '#f59e0b' }}>You have unsaved changes</p>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={resetToDefaults} 
              style={{
                padding: '8px 16px',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
            >
              Reset to Defaults
            </button>
            <button 
              onClick={loadSettings} 
              disabled={!hasUnsavedChanges}
              style={{
                padding: '8px 16px',
                backgroundColor: hasUnsavedChanges ? '#333' : '#222',
                border: '1px solid #444',
                borderRadius: '6px',
                color: hasUnsavedChanges ? '#fff' : '#666',
                fontWeight: 500,
                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Discard Changes
            </button>
            <button 
              onClick={saveSettings} 
              disabled={!hasUnsavedChanges}
              style={{
                padding: '8px 16px',
                backgroundColor: hasUnsavedChanges ? '#4a90e2' : '#222',
                border: 'none',
                borderRadius: '6px',
                color: hasUnsavedChanges ? '#fff' : '#666',
                fontWeight: 500,
                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification Toast */}
      {saveStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div style={{
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: saveStatus.includes('success') ? '#10b981' : '#ef4444',
            color: '#fff'
          }}>
            {saveStatus.includes('success') ? <CheckIcon /> : <XIcon />}
            <span>{saveStatus}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333', padding: '0 24px' }}>
        <div className="flex gap-1">
          {(['overlay', 'edge', 'shortcuts', 'general'] as const).map(tab => {
            const getTabIcon = () => {
              switch (tab) {
                case 'overlay': return <GridIcon />;
                case 'edge': return <MouseIcon />;
                case 'shortcuts': return <KeyboardIcon />;
                case 'general': return <SettingsIcon />;
                default: return null;
              }
            };
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === tab ? '#0f0f0f' : 'transparent',
                  borderBottom: activeTab === tab ? '2px solid #4a90e2' : 'none',
                  color: activeTab === tab ? '#fff' : '#888',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.color = '#888';
                  }
                }}
              >
                {getTabIcon()}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'edge' && ' Hover'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
        {activeTab === 'overlay' && renderOverlaySettings()}
        {activeTab === 'edge' && renderEdgeSettings()}
        {activeTab === 'shortcuts' && (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#666' }}>
            <p>Shortcuts settings coming soon...</p>
          </div>
        )}
        {activeTab === 'general' && (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#666' }}>
            <p>General settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsViewPro;
