import React from 'react';
import { Overlay } from './Overlay';

interface InfoOverlayProps {
  title: string;
  message: string;
  targetElement?: HTMLElement;
  onClose?: () => void;
}

export const InfoOverlay: React.FC<InfoOverlayProps> = ({
  title,
  message,
  targetElement,
  onClose
}) => {
  return (
    <Overlay
      targetElement={targetElement}
      onClose={onClose}
      className="tribal-farm-info-overlay"
    >
      <div className="info-overlay-content">
        <div className="info-overlay-header">
          <h3>{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="close-button"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
        <div className="info-overlay-body">
          <p>{message}</p>
        </div>
      </div>
    </Overlay>
  );
};

// Add styles to the page
const style = document.createElement('style');
style.textContent = `
  .tribal-farm-info-overlay {
    min-width: 200px;
    max-width: 400px;
    animation: slideIn 0.2s ease-out;
  }

  .info-overlay-content {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }

  .info-overlay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .info-overlay-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 20px;
    color: #666;
    cursor: pointer;
    padding: 0 4px;
  }

  .close-button:hover {
    color: #333;
  }

  .info-overlay-body {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

document.head.appendChild(style);