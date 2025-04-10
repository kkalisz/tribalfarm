import { createRoot } from 'react-dom/client';
import React from 'react';
import './style.css' 

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing content script');
  initializeContentScript();
});

// If DOMContentLoaded already fired, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already loaded, initializing content script immediately');
  initializeContentScript();
}

function initializeContentScript() {
  try {
    console.log('Initializing content script');

    // Create a container with explicit styling to ensure visibility
    const div = document.createElement('div');
    div.id = '__root';

    // Apply inline styles to ensure the container is visible
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.left = '0';
    div.style.width = 'auto';
    div.style.height = 'auto';
    div.style.zIndex = '9999'; // Very high z-index to ensure visibility
    div.style.pointerEvents = 'auto';

    // Append to body
    document.body.appendChild(div);
    console.log('Root container created and appended to body');

    // Get the container and create a React root
    const rootContainer = document.querySelector('#__root');
    if (!rootContainer) {
      throw new Error("Can't find Content root element");
    }

    const root = createRoot(rootContainer);
    console.log('React root created');

    // Render the component with explicit styling
    root.render(
      <div 
        style={{
          padding: '10px',
          backgroundColor: '#fbbf24', // amber-400
          color: 'black',
          fontSize: '1.125rem', // text-lg
          fontWeight: 'bold',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          margin: '10px',
          pointerEvents: 'auto'
        }}
      >
        content script <span className='your-class'>loaded</span>
      </div>
    );
    console.log('React component rendered');
  } catch (e) {
    console.log('Error in content script initialization:');
    console.error(e);
  }
}
