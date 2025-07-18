import React, { useState, useEffect } from 'react';
import { Settings } from '../../../types';

const SettingsViewNew: React.FC = () => {
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

  const handleSettingChange = (key: string, value: any) => {
    if (!settings) return;
    
    if (key.startsWith('overlay.')) {
      const overlayKey = key.replace('overlay.', '') as keyof typeof settings.overlay;
      updateSetting('overlay', overlayKey, value);
    } else if (key.startsWith('edgeHover.')) {
      const edgeKey = key.replace('edgeHover.', '') as keyof typeof settings.edgeHover;
      updateSetting('edgeHover', edgeKey, value);
    }
  };

  const resetToDefaults = () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) return;
    
    // Reset to default settings
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
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderOverlaySettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          Grid Layout
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Columns</label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.overlay.gridCols}
              onChange={(e) => updateSetting('overlay', 'gridCols', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400 mt-1">{settings.overlay.gridCols}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Rows</label>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.overlay.gridRows}
              onChange={(e) => updateSetting('overlay', 'gridRows', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400 mt-1">{settings.overlay.gridRows}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Node Appearance
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Width</label>
            <input
              type="range"
              min="100"
              max="300"
              value={settings.overlay.nodeWidth}
              onChange={(e) => updateSetting('overlay', 'nodeWidth', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400 mt-1">{settings.overlay.nodeWidth}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.overlay.nodeHeight}
              onChange={(e) => updateSetting('overlay', 'nodeHeight', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400 mt-1">{settings.overlay.nodeHeight}px</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Node Style</label>
            <select
              value={settings.overlay.nodeStyle || 'rounded'}
              onChange={(e) => updateSetting('overlay', 'nodeStyle', e.target.value as 'square' | 'rounded' | 'circle' | 'hexagon')}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="rounded">Rounded</option>
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="hexagon">Hexagon</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Animation Speed</label>
            <select
              value={settings.overlay.animationSpeed}
              onChange={(e) => updateSetting('overlay', 'animationSpeed', e.target.value as 'instant' | 'fast' | 'normal' | 'slow')}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="instant">Instant</option>
              <option value="fast">Fast</option>
              <option value="normal">Normal</option>
              <option value="slow">Slow</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Gap</label>
            <input
              type="range"
              min="0"
              max="32"
              value={settings.overlay.nodeGap || 16}
              onChange={(e) => updateSetting('overlay', 'nodeGap', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-400 mt-1">{settings.overlay.nodeGap || 16}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Border Radius</label>
            <input
              type="range"
              min="0"
              max="24"
              value={settings.overlay.nodeRadius || 12}
              onChange={(e) => updateSetting('overlay', 'nodeRadius', parseInt(e.target.value))}
              className="w-full"
              disabled={settings.overlay.nodeStyle !== 'rounded'}
            />
            <div className="text-center text-sm text-gray-400 mt-1">{settings.overlay.nodeRadius || 12}px</div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Theme</label>
          <select
            value={settings.overlay.theme}
            onChange={(e) => updateSetting('overlay', 'theme', e.target.value as 'light' | 'dark' | 'system')}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderEdgeSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Edge Hover Settings</h2>
        
        <div className="mb-4">
          <label className="flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              checked={settings.edgeHover.enabled}
              onChange={(e) => updateSetting('edgeHover', 'enabled', e.target.checked)}
              className="mr-2"
            />
            Enable Edge Hover
          </label>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-300">Hover Position</label>
          <select
            value={settings.edgeHover.position}
            onChange={(e) => updateSetting('edgeHover', 'position', e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            disabled={!settings.edgeHover.enabled}
          >
            <option value="left-center">Left Center</option>
            <option value="right-center">Right Center</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-300">Trigger Size (px)</label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.edgeHover.triggerSize}
            onChange={(e) => updateSetting('edgeHover', 'triggerSize', parseInt(e.target.value))}
            className="w-full"
            disabled={!settings.edgeHover.enabled}
          />
          <div className="text-center text-sm text-gray-400 mt-1">{settings.edgeHover.triggerSize}px</div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm text-gray-300">Trigger Delay (ms)</label>
          <input
            type="range"
            min="0"
            max="2000"
            step="100"
            value={settings.edgeHover.delay}
            onChange={(e) => updateSetting('edgeHover', 'delay', parseInt(e.target.value))}
            className="w-full"
            disabled={!settings.edgeHover.enabled}
          />
          <div className="text-center text-sm text-gray-400 mt-1">{settings.edgeHover.delay}ms</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100" style={{ backgroundColor: '#111827', color: '#f3f4f6' }}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          {hasUnsavedChanges && (
            <p className="text-sm text-yellow-400 mt-1">You have unsaved changes</p>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={resetToDefaults} 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium transition-colors"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={loadSettings} 
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-medium transition-colors"
            disabled={!hasUnsavedChanges}
          >
            Discard Changes
          </button>
          <button 
            onClick={saveSettings} 
            className={`px-4 py-2 rounded text-white font-medium transition-colors ${
              hasUnsavedChanges 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
            disabled={!hasUnsavedChanges}
          >
            Save Settings
          </button>
        </div>
      </div>
      
      {/* Notification Toast */}
      {saveStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            saveStatus.includes('success') 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {saveStatus.includes('success') ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{saveStatus}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-1">
          {(['overlay', 'edge', 'shortcuts', 'general'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                  : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'edge' && ' Hover'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Settings Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overlay' && renderOverlaySettings()}
          {activeTab === 'edge' && renderEdgeSettings()}
          {activeTab === 'shortcuts' && (
            <div className="text-gray-400 text-center mt-10">
              <p>Shortcuts settings coming soon...</p>
            </div>
          )}
          {activeTab === 'general' && (
            <div className="text-gray-400 text-center mt-10">
              <p>General settings coming soon...</p>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {activeTab === 'overlay' && (
          <div className="w-1/2 bg-gray-800 border-l border-gray-700 p-6 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-gray-900 rounded-lg p-8 border-2 border-dashed border-gray-600">
                <div 
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(3, settings.overlay.gridCols || 3)}, 1fr)`,
                    gap: `${settings.overlay.nodeGap || 16}px`
                  }}
                >
                  {[...Array(Math.min(6, (settings.overlay.gridCols || 3) * Math.min(2, settings.overlay.gridRows || 3)))].map((_, i) => (
                    <div
                      key={i}
                      className="transition-all duration-300 hover:scale-105"
                      style={{
                        width: `${settings.overlay.nodeWidth}px`,
                        height: `${settings.overlay.nodeHeight}px`,
                        backgroundColor: 'rgba(20, 20, 20, 0.98)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        borderRadius: settings.overlay.nodeStyle === 'rounded' ? `${settings.overlay.nodeRadius || 12}px` : 
                                     settings.overlay.nodeStyle === 'circle' ? '50%' : 
                                     settings.overlay.nodeStyle === 'hexagon' ? '0' : '0',
                        clipPath: settings.overlay.nodeStyle === 'hexagon' ? 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {i === 0 ? 'Node 1' : `Node ${i + 1}`}
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-400 mt-4">Preview updates as you change settings</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsViewNew;
