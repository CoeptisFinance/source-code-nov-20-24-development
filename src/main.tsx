import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './index.css';
import './styles/pwa.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error creating root:', error);
}