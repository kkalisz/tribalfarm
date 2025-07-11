import { useEffect, RefObject } from 'react';

export function useShadowDomOutsideClick({
                                           ref,
                                           handler,
                                           enabled = true,
                                         }: {
  ref: RefObject<HTMLElement>;
  handler: () => void;
  enabled?: boolean;
}): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: Event) => {
      // Get the shadow root containing the component
      const shadowRoot = ref.current?.getRootNode() as ShadowRoot;

      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    // Get the shadow root containing the component
    const shadowRoot = ref.current?.getRootNode() as ShadowRoot;

    // Add event listener to the shadow root instead of document
    if (shadowRoot instanceof ShadowRoot) {
      // Use type assertion to handle the event listener
      (shadowRoot as unknown as EventTarget).addEventListener('mousedown', handleClickOutside);

      return () => {
        (shadowRoot as unknown as EventTarget).removeEventListener('mousedown', handleClickOutside);
      };
    }

    // Fallback to document if not in shadow DOM
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}