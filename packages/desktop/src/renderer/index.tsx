import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import the new App component
import '../assets/styles/global.css'; // Assuming you have some global styles

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
