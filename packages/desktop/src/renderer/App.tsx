import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ClipboardManagerView from './components/views/ClipboardManagerView';
import SnippetManagerView from './components/views/SnippetManagerView';
import SettingsView from './components/views/SettingsView';
import ChainManagerView from './components/ChainManagerView';

const App: React.FC = () => {
  console.log('🚀 App component is loading!');
  const [currentView, setCurrentView] = useState('snippets'); // Default to snippets view
  console.log('🚀 App component currentView initialized to:', currentView);

  useEffect(() => {
    const handleNavigation = (view: string) => {
      console.log('Navigation event received:', view);
      setCurrentView(view);
    };
    const handleSettingsNavigation = () => {
      console.log('Settings navigation event received');
      setCurrentView('settings');
    };
    
    const cleanup1 = window.api.on('navigate-to-view', handleNavigation);
    const cleanup2 = window.api.on('navigate-to-settings', handleSettingsNavigation);
    
    return () => {
      if (cleanup1) cleanup1();
      if (cleanup2) cleanup2();
    };
  }, []);

  // Debug: Log current view changes
  useEffect(() => {
    console.log('🔄 USEEFFECT: Current view changed to:', currentView);
    console.log('🔄 USEEFFECT: This should trigger a re-render');
  }, [currentView]);
  
  // Debug setCurrentView function
  const handleSetCurrentView = (view: string) => {
    console.log('🔄 handleSetCurrentView called with:', view);
    console.log('🔄 Previous currentView:', currentView);
    setCurrentView(view);
    console.log('🔄 setCurrentView called, expecting re-render');
  };

  let viewToRender;
  console.log('Rendering view:', currentView);
  switch (currentView) {
    case 'clipboard':
      viewToRender = <ClipboardManagerView />;
      break;
    case 'snippets':
      viewToRender = <SnippetManagerView />;
      break;
    case 'chains':
      viewToRender = <ChainManagerView />;
      break;
    case 'settings':
      console.log('🔧 Rendering SettingsView component');
      console.log('🔧 SettingsView imported:', SettingsView);
      viewToRender = <SettingsView />;
      console.log('🔧 SettingsView component assigned to viewToRender');
      break;
    default:
      viewToRender = <ClipboardManagerView />;
  }

  console.log('🔧 About to render App with currentView:', currentView);
  console.log('🔧 viewToRender is:', viewToRender);
  
  return (
    <div className="app-container">
      <Sidebar onNavigate={handleSetCurrentView} activeView={currentView} />
      <div className="content-area">
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'orange',
          color: 'black',
          padding: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Current View: {currentView}
        </div>
        {viewToRender}
      </div>
    </div>
  );
};

export default App; 