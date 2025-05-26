import React from 'react';

interface SidebarProps {
  onNavigate: (view: string) => void;
  activeView?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeView }) => {
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
            <button onClick={() => window.api.openChainManager()} className={activeView === 'chains' ? 'active' : ''}>
              Chain Manager
            </button>
          </li>
          <li>
            <button onClick={() => onNavigate('settings')} className={activeView === 'settings' ? 'active' : ''}>
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