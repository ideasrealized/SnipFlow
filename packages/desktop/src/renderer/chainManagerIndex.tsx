import React from 'react';
import { createRoot } from 'react-dom/client';
import ChainManagerView from './components/ChainManagerView';
import '../assets/styles/global.css';

const rootElement = document.getElementById('chain-manager-root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ChainManagerView />
    </React.StrictMode>
  );
} else {
  console.error('Root element #chain-manager-root not found in chainManager.html');
} 