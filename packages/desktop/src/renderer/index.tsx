console.log('🚀 React index.tsx loaded - STARTING EXECUTION');

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('🚨 UNCAUGHT ERROR:', event.error);
  console.error('🚨 Error message:', event.message);
  console.error('🚨 Error filename:', event.filename);
  console.error('🚨 Error lineno:', event.lineno);
  console.error('🚨 Error colno:', event.colno);
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 UNHANDLED PROMISE REJECTION:', event.reason);
  console.error('🚨 Promise:', event.promise);
});

try {
  console.log('🚀 Attempting to import React...');
  import('react').then(() => {
    console.log('🚀 React imported successfully');
  }).catch(err => {
    console.error('❌ React import failed:', err);
  });
  
  console.log('🚀 Attempting to import ReactDOM...');
  import('react-dom/client').then(() => {
    console.log('🚀 ReactDOM imported successfully');
  }).catch(err => {
    console.error('❌ ReactDOM import failed:', err);
  });
  
  console.log('🚀 Attempting synchronous imports...');
  const React = require('react');
  const ReactDOM = require('react-dom/client');
  console.log('🚀 Synchronous imports successful');
  
  console.log('🚀 Attempting to import App component...');
  const App = require('./App').default;
  console.log('🚀 App component imported:', typeof App);
  
  console.log('🚀 Attempting to import global CSS...');
  require('../assets/styles/global.css');
  console.log('🚀 Global CSS imported successfully');
  
  console.log('🚀 Attempting to import Tailwind CSS...');
  require('../styles/globals.css');
  console.log('🚀 Tailwind CSS imported successfully');
  
  // Apply dark mode class to body for Tailwind
  document.body.classList.add('dark');
  console.log('🚀 Dark mode class added to body');
  
  console.log('🚀 Looking for root element...');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('❌ Failed to find the root element');
    console.error('❌ Document body:', document.body);
    console.error('❌ Document HTML:', document.documentElement.outerHTML.substring(0, 500));
    throw new Error('Failed to find the root element');
  }
  
  console.log('🚀 Root element found:', rootElement);
  console.log('🚀 Root element properties:', {
    id: rootElement.id,
    className: rootElement.className,
    innerHTML: rootElement.innerHTML.substring(0, 100)
  });
  
  console.log('🚀 Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('🚀 React root created successfully:', root);
  
  console.log('🚀 Rendering App component...');
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(App, null)
    )
  );
  
  console.log('🚀 React app rendered successfully!');
  
  // Add a delayed check to see if the app actually mounted
  setTimeout(() => {
    console.log('🚀 DELAYED CHECK: Root element content:', rootElement.innerHTML.substring(0, 200));
    if (rootElement.innerHTML.length > 0) {
      console.log('🚀 SUCCESS: React app appears to be mounted');
    } else {
      console.error('❌ FAILURE: React app did not mount - root element is empty');
    }
  }, 1000);
  
} catch (error) {
  console.error('🚨 CRITICAL ERROR in React index.tsx:', error);
  const err = error as Error;
  console.error('🚨 Error stack:', err.stack);
  console.error('🚨 Error message:', err.message);
  console.error('🚨 Error name:', err.name);
  
  // Create a fallback error display
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px; font-family: monospace;">
        <h2>React App Failed to Start</h2>
        <p><strong>Error:</strong> ${err.message}</p>
        <p><strong>Stack:</strong></p>
        <pre>${err.stack}</pre>
      </div>
    `;
  }
}
