import React, { useState, useEffect } from 'react';

const SettingsViewSimple: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edgeHoverEnabled, setEdgeHoverEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await window.api.invoke('get-settings');
      setSettings(loadedSettings);
      setEdgeHoverEnabled(loadedSettings?.edgeHover?.enabled ?? true);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const toggleEdgeHover = async () => {
    try {
      const newValue = !edgeHoverEnabled;
      const result = await window.api.invoke('save-settings', {
        ...settings,
        edgeHover: {
          ...settings.edgeHover,
          enabled: newValue
        }
      });
      if (result.success) {
        setEdgeHoverEnabled(newValue);
        await loadSettings();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const testShowOverlay = () => {
    console.log('Testing overlay show...');
    window.api.send('test-show-overlay');
  };

  if (loading) {
    return (
      <div style={{
        background: '#2a2a2a',
        color: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        minHeight: '100%',
        textAlign: 'center'
      }}>
        <h2>Loading Settings...</h2>
      </div>
    );
  }

  return (
    <div style={{
      background: '#2a2a2a',
      color: '#ffffff',
      padding: '40px',
      borderRadius: '12px',
      minHeight: '100%'
    }}>
      <h1 style={{ color: '#4a90e2', marginBottom: '30px' }}>Settings & Debug</h1>
      
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#4a90e2', marginBottom: '15px' }}>Edge Hover Settings</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={edgeHoverEnabled}
              onChange={toggleEdgeHover}
              style={{ width: '20px', height: '20px' }}
            />
            <span>Enable Edge Hover</span>
          </label>
        </div>
        
        <button onClick={testShowOverlay} style={{
          background: '#4a90e2',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Test Show Overlay
        </button>
      </div>
      
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#4a90e2', marginBottom: '15px' }}>Current Settings</h3>
        <pre style={{
          background: '#0a0a0a',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '12px',
          color: '#aaa'
        }}>
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>
      
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #444'
      }}>
        <h3 style={{ color: '#4a90e2', marginBottom: '15px' }}>System Info</h3>
        <p>Electron: {process.versions.electron}</p>
        <p>Node: {process.versions.node}</p>
        <p>Chrome: {process.versions.chrome}</p>
      </div>
    </div>
  );
};

export default SettingsViewSimple;
