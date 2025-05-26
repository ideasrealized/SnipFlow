import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ClipboardManagerView from './components/views/ClipboardManagerView';
import SnippetManagerView from './components/views/SnippetManagerView';
import SettingsView from './components/views/SettingsView';
// Assuming ChainManagerView will be imported when available/reintegrated
// import ChainManagerView from './components/views/ChainManagerView'; 

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('clipboard'); // Default view

  let viewToRender;
  switch (currentView) {
    case 'clipboard':
      viewToRender = <ClipboardManagerView />;
      break;
    case 'snippets':
      viewToRender = <SnippetManagerView />;
      break;
    case 'chains':
      // Placeholder for ChainManagerView - you'll need to create or import this
      // For now, it can be a simple div or one of the other views as a temp.
      viewToRender = <div className="view-container"><h2>Chain Manager View (To be implemented/reintegrated)</h2></div>;
      // viewToRender = <ChainManagerView />;
      break;
    case 'settings':
      viewToRender = <SettingsView />;
      break;
    default:
      viewToRender = <ClipboardManagerView />;
  }

  return (
    <div className="app-container">
      <Sidebar onNavigate={setCurrentView} />
      <div className="content-area">
        {viewToRender}
      </div>
    </div>
  );
};

export default App; 