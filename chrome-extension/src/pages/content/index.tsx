import { createRoot } from 'react-dom/client';
import React from 'react';


/** React Component for the Sidebar Views */
export const SidebarContainer = () => {
  console.log('SidebarContainer');
  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none bg-amber-200"
      style={{ zIndex: 99999 }}
    >
      {/* Left Sidebar */}
      <div
        className="fixed top-0 left-0 h-full w-1/4 bg-blue-500 bg-opacity-80 text-white"
        style={{ pointerEvents: 'none' }}
      >
        <div className="p-4">
          <h2 className="font-bold text-lg">Left Sidebar</h2>
          <p>This is the left view!</p>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        className="fixed top-0 right-0 h-full w-1/4 bg-green-500 bg-opacity-80 text-white"
        style={{ pointerEvents: 'none' }}
      >
        <div className="p-4">
          <h2 className="font-bold text-lg">Right Sidebar</h2>
          <p>This is the right view!</p>
        </div>
      </div>
    </div>
  );
};

// Function to check if the current domain matches our pattern
function isValidDomain(): boolean {
  const hostname = window.location.hostname;

  // Check if it's a plemiona.pl domain
  if (!hostname.endsWith('.plemiona.pl')) {
    return false;
  }

  // Extract the subdomain (everything before .plemiona.pl)
  const subdomain = hostname.substring(0, hostname.length - '.plemiona.pl'.length);

  // Check if subdomain starts with 'pl' and ends with a number
  return /^pl.*\d$/.test(subdomain);
}

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, checking domain before initializing');
  if (isValidDomain()) {
    console.log('Valid domain detected, initializing content script');
    initializeContentScript();
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
});

// If DOMContentLoaded already fired, initialize immediately if domain is valid
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('DOM already loaded, checking domain before initializing');
  if (isValidDomain()) {
    console.log('Valid domain detected, initializing content script immediately');
    initializeContentScript();
  } else {
    console.log('Domain does not match required pattern, content script will not initialize');
  }
}

function initializeContentScript() {
  try {
    console.log('Initializing content script with Tailwind via Play CDN and Shadow DOM');

    // Create a container and attach a shadow DOM
    const container = document.createElement('div');
    container.id = '__root-extension-container';
    const shadowRoot = container.attachShadow({ mode: 'open' });
    document.body.appendChild(container);

    console.log('Shadow root created and attached to container');

    // Dynamically load Tailwind's CDN stylesheet into the shadow DOM
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute(
      'href',
      'https://cdn.jsdelivr.net/npm/tailwindcss@3.3.3/dist/tailwind.min.css'
    );
    shadowRoot.appendChild(linkElement);

    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '100vw'; // Fullscreen width
    container.style.height = '100vh';
    container.style.zIndex = '999999'; // Very high z-index to ensure visibility
    container.style.pointerEvents = 'none';

    console.log('Tailwind CSS loaded via CDN into shadow root');

    // Create a div inside the shadowRoot to serve as the React root container
    const shadowRootContent = document.createElement('div');
    shadowRootContent.id = '__shadow-content';

    shadowRootContent.style.position = 'fixed';
    shadowRootContent.style.bottom = '0';
    shadowRootContent.style.left = '0';
    shadowRootContent.style.width = '100vw'; // Fullscreen width
    shadowRootContent.style.height = '100vh';
    shadowRootContent.style.zIndex = '999999'; // Very high z-index to ensure visibility
    shadowRootContent.style.pointerEvents = 'none';

    shadowRoot.appendChild(shadowRootContent);

    console.log('React container created inside shadow root');

    // Mount the React app inside the shadowRoot container
    const root = createRoot(shadowRootContent);
    console.log(`React app created ${!!root}`);
    root.render(<SidebarContainer />);

    console.log('React app successfully rendered with Tailwind in Shadow DOM');
  } catch (err) {
    console.error('Error initializing content script:', err);
  }
}

