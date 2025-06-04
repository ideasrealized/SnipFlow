import React from 'react';

const SettingsView: React.FC = () => {
  // Example: Button to trigger an IPC call
  const handleExportDiagnostics = () => {
    window.api
      .invoke('export-diagnostics')
      .then(() => console.log('Diagnostics exported'))
      .catch(err => console.error('Error exporting diagnostics:', err));
  };

  return (
    <div>
      <h2>Settings & Debug View</h2>
      <button onClick={handleExportDiagnostics}>Export Diagnostics</button>
      {/* More settings and debug options will go here */}
    </div>
  );
};

export default SettingsView;
