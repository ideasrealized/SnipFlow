import React, { useState, useEffect } from 'react';
import { Settings } from '../../../types';

const SettingsViewNew: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await window.api.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    try {
      await window.api.saveSettings(settings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('Failed to save settings');
    }
  };

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [category]: {
        ...(settings[category] as any),
        [key]: value
      }
    });
  };

  if (!settings) {
    return <div style={containerStyle}>Loading settings...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Settings</h1>
      
      {saveStatus && (
        <div style={saveStatus.includes('success') ? successStyle : errorStyle}>
          {saveStatus}
        </div>
      )}

      <div style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Overlay Settings</h2>
        
        <div style={fieldStyle}>
          <label style={labelStyle}>Grid Columns</label>
          <input
            type="number"
            value={settings.overlay.gridCols}
            onChange={(e) => updateSetting('overlay', 'gridCols', parseInt(e.target.value))}
            style={inputStyle}
            min="1"
            max="10"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Grid Rows</label>
          <input
            type="number"
            value={settings.overlay.gridRows}
            onChange={(e) => updateSetting('overlay', 'gridRows', parseInt(e.target.value))}
            style={inputStyle}
            min="1"
            max="10"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Node Width (px)</label>
          <input
            type="number"
            value={settings.overlay.nodeWidth}
            onChange={(e) => updateSetting('overlay', 'nodeWidth', parseInt(e.target.value))}
            style={inputStyle}
            min="100"
            max="300"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Node Height (px)</label>
          <input
            type="number"
            value={settings.overlay.nodeHeight}
            onChange={(e) => updateSetting('overlay', 'nodeHeight', parseInt(e.target.value))}
            style={inputStyle}
            min="50"
            max="200"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Animation Speed</label>
          <select
            value={settings.overlay.animationSpeed}
            onChange={(e) => updateSetting('overlay', 'animationSpeed', e.target.value)}
            style={selectStyle}
          >
            <option value="instant">Instant</option>
            <option value="fast">Fast</option>
            <option value="normal">Normal</option>
            <option value="slow">Slow</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Theme</label>
          <select
            value={settings.overlay.theme}
            onChange={(e) => updateSetting('overlay', 'theme', e.target.value)}
            style={selectStyle}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Node Style</label>
          <select
            value={settings.overlay.nodeStyle || 'rounded'}
            onChange={(e) => updateSetting('overlay', 'nodeStyle', e.target.value)}
            style={selectStyle}
          >
            <option value="rounded">Rounded</option>
            <option value="square">Square</option>
            <option value="circle">Circle</option>
            <option value="hexagon">Hexagon</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Node Gap (px)</label>
          <input
            type="number"
            value={settings.overlay.nodeGap || 16}
            onChange={(e) => updateSetting('overlay', 'nodeGap', parseInt(e.target.value))}
            style={inputStyle}
            min="5"
            max="50"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Node Border Radius (px)</label>
          <input
            type="number"
            value={settings.overlay.nodeRadius || 12}
            onChange={(e) => updateSetting('overlay', 'nodeRadius', parseInt(e.target.value))}
            style={inputStyle}
            min="0"
            max="50"
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionHeaderStyle}>Edge Hover Settings</h2>
        
        <div style={fieldStyle}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={settings.edgeHover.enabled}
              onChange={(e) => updateSetting('edgeHover', 'enabled', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Enable Edge Hover
          </label>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Hover Position</label>
          <select
            value={settings.edgeHover.position}
            onChange={(e) => updateSetting('edgeHover', 'position', e.target.value)}
            style={selectStyle}
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

        <div style={fieldStyle}>
          <label style={labelStyle}>Trigger Size (px)</label>
          <input
            type="number"
            value={settings.edgeHover.triggerSize}
            onChange={(e) => updateSetting('edgeHover', 'triggerSize', parseInt(e.target.value))}
            style={inputStyle}
            disabled={!settings.edgeHover.enabled}
            min="10"
            max="100"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Trigger Delay (ms)</label>
          <input
            type="number"
            value={settings.edgeHover.delay}
            onChange={(e) => updateSetting('edgeHover', 'delay', parseInt(e.target.value))}
            style={inputStyle}
            disabled={!settings.edgeHover.enabled}
            min="0"
            max="2000"
            step="100"
          />
        </div>
      </div>

      <div style={buttonContainerStyle}>
        <button onClick={saveSettings} style={saveButtonStyle}>
          Save Settings
        </button>
        <button onClick={loadSettings} style={cancelButtonStyle}>
          Reset Changes
        </button>
        <button onClick={() => window.api.send('test-show-overlay')} style={testButtonStyle}>
          Test Overlay
        </button>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  padding: '30px',
  height: '100%',
  overflowY: 'auto',
  fontFamily: 'Arial, sans-serif',
};

const headerStyle: React.CSSProperties = {
  fontSize: '28px',
  marginBottom: '20px',
  color: '#ffffff',
};

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#2a2a2a',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '20px',
  border: '1px solid #3a3a3a',
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '20px',
  marginBottom: '15px',
  color: '#ffffff',
};

const fieldStyle: React.CSSProperties = {
  marginBottom: '15px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '5px',
  fontSize: '14px',
  color: '#cccccc',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  backgroundColor: '#3a3a3a',
  border: '1px solid #4a4a4a',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '30px',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: '4px',
  border: 'none',
  fontSize: '14px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const saveButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#4CAF50',
  color: 'white',
};

const cancelButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#666',
  color: 'white',
};

const testButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#2196F3',
  color: 'white',
};

const successStyle: React.CSSProperties = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '20px',
  textAlign: 'center',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#f44336',
  color: 'white',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '20px',
  textAlign: 'center',
};

export default SettingsViewNew;
