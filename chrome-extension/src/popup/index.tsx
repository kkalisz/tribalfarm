import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});