import React from 'react';

interface SidebarProps {
  onNavigate: (view: string) => void;
  activeView?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView }) => {
  console.log('Sidebar rendered with activeView:', activeView);
  // Inline styles removed, will use classes from global.css
  // const sidebarStyle: React.CSSProperties = {
  //   width: '200px',
  //   padding: '20px',
  //   borderRight: '1px solid #ccc',
  //   height: '100vh',
  //   backgroundColor: '#f0f0f0'
  // };

  // const navButtonStyle: React.CSSProperties = {
  //   display: 'block',
  //   width: '100%',
  //   padding: '10px',
  //   marginBottom: '10px',
  //   border: 'none',
  //   textAlign: 'left',
  //   cursor: 'pointer',
  //   backgroundColor: '#e0e0e0',
  //   borderRadius: '4px'
  // };

  return (
    <div className="sidebar-container"> {/* Using class from global.css */}
      <h3>SnipFlow</h3>
      <nav>
        <ul>
          <li>
            <button onClick={() => onNavigate('clipboard')} className={activeView === 'clipboard' ? 'active' : ''}>
              Clipboard Manager
            </button>
          </li>
          <li>
            <button onClick={() => onNavigate('snippets')} className={activeView === 'snippets' ? 'active' : ''}>
              Snippet Manager
            </button>
          </li>
          <li>
<button onClick={() => onNavigate('chains')} className={activeView === 'chains' ? 'active' : ''}>
              Chain Manager
            </button>
          </li>
          <li>
            <button onClick={() => {
              console.log('🚨 SETTINGS BUTTON CLICKED!');
              console.log('🚨 Current activeView:', activeView);
              console.log('🚨 onNavigate function:', onNavigate);
              console.log('🚨 About to call onNavigate with settings');
              onNavigate('settings');
              console.log('🚨 onNavigate(settings) called successfully');
              console.log('🚨 Expected activeView should change to: settings');
            }} className={activeView === 'settings' ? 'active' : ''}>
              Settings & Debug
            </button>
          </li>
        </ul>
      </nav>
      {/* Add more links as needed */}
    </div>
  );
};

export default Sidebar; 