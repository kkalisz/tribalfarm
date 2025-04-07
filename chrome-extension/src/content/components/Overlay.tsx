import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Position {
  top: number;
  left: number;
}

interface OverlayProps {
  children: React.ReactNode;
  targetElement?: HTMLElement;
  position?: Position;
  className?: string;
  onClose?: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  children,
  targetElement,
  position,
  className = '',
  onClose
}) => {
  const [overlayPosition, setOverlayPosition] = useState<Position>({ top: 0, left: 0 });
  const [container] = useState(() => {
    const div = document.createElement('div');
    div.className = 'tribal-farm-overlay-container';
    div.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    return div;
  });

  useEffect(() => {
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      setOverlayPosition({
        top: rect.bottom + scrollTop,
        left: rect.left + scrollLeft
      });
    } else if (position) {
      setOverlayPosition(position);
    }
  }, [targetElement, position]);

  const handleClickOutside = (e: MouseEvent) => {
    if (onClose && !container.contains(e.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (onClose) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [onClose]);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${overlayPosition.top}px`,
    left: `${overlayPosition.left}px`,
    zIndex: 10000,
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    padding: '8px',
    pointerEvents: 'auto',
    ...position && { top: `${position.top}px`, left: `${position.left}px` }
  };

  return createPortal(
    <div style={overlayStyle} className={`tribal-farm-overlay ${className}`}>
      {children}
    </div>,
    container
  );
};
