import React from 'react';
import ReactDOM from 'react-dom';
import ChainManagerView from './components/ChainManagerView';
import '../assets/styles/global.css';

const rootElement = document.getElementById('chain-manager-root');

if (rootElement) {
  ReactDOM.render(
    <React.StrictMode>
      <ChainManagerView />
    </React.StrictMode>,
    rootElement
  );
} else {
  console.error('Root element #chain-manager-root not found in chainManager.html');
} 