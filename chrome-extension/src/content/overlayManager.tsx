import React from 'react';
import { createRoot } from 'react-dom/client';
import { InfoOverlay } from './components/InfoOverlay';

interface ShowOverlayOptions {
  title: string;
  message: string;
  targetElement?: HTMLElement;
  duration?: number;
}

export class OverlayManager {
  private static instance: OverlayManager;
  private activeOverlays: Map<string, { root: any; container: HTMLElement }>;

  private constructor() {
    this.activeOverlays = new Map();
  }

  public static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }

  public showOverlay(id: string, options: ShowOverlayOptions): void {
    // Clean up existing overlay with the same ID if it exists
    this.hideOverlay(id);

    const container = document.createElement('div');
    container.id = `tribal-farm-overlay-${id}`;
    document.body.appendChild(container);

    const root = createRoot(container);
    
    const handleClose = () => {
      this.hideOverlay(id);
    };

    root.render(
      <InfoOverlay
        title={options.title}
        message={options.message}
        targetElement={options.targetElement}
        onClose={handleClose}
      />
    );

    this.activeOverlays.set(id, { root, container });

    // Auto-hide overlay if duration is specified
    if (options.duration) {
      setTimeout(() => {
        this.hideOverlay(id);
      }, options.duration);
    }
  }

  public hideOverlay(id: string): void {
    const overlay = this.activeOverlays.get(id);
    if (overlay) {
      const { root, container } = overlay;
      root.unmount();
      container.remove();
      this.activeOverlays.delete(id);
    }
  }

  public hideAllOverlays(): void {
    for (const id of this.activeOverlays.keys()) {
      this.hideOverlay(id);
    }
  }
}

export const overlayManager = OverlayManager.getInstance();