import { useState, useEffect } from 'react';

/**
 * Type for the return value of the useQueryParams hook
 * A simple record of string keys to string values
 */
export type QueryParamsResult = Record<string, string>;

/**
 * Hook to extract query parameters from the URL
 * 
 * @returns An object with all query parameters as direct properties for destructuring
 * 
 * @example
 * // URL: https://example.com?name=John&age=25
 * 
 * const { name, age } = useQueryParams(); // name: 'John', age: '25'
 */
export function useQueryParams(): QueryParamsResult {
  // Store the parsed query parameters
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  // Parse the query parameters from a URL
  const parseQueryParams = (url: string): Record<string, string> => {
    const params: Record<string, string> = {};
    try {
      // Create a URL object to easily extract the search params
      const urlObj = new URL(url);
      // Get all search params
      const searchParams = new URLSearchParams(urlObj.search);
      
      // Convert the search params to a record object
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    } catch (error) {
      console.warn('Error parsing URL query parameters:', error);
    }
    return params;
  };

  useEffect(() => {
    // Parse the initial URL
    const initialParams = parseQueryParams(window.location.href);
    setQueryParams(initialParams);

    // Store the current URL to compare against for changes
    let previousUrl = window.location.href;

    // Create a function to handle URL changes
    const handleUrlChange = () => {
      const newParams = parseQueryParams(window.location.href);
      setQueryParams(newParams);
    };

    // Listen for popstate events (browser back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);

    // Use a MutationObserver to detect changes to the URL that don't trigger popstate
    // This is useful for single-page applications that use history.pushState
    const observer = new MutationObserver((mutations) => {
      const currentUrl = window.location.href;
      
      // Only process if the URL has actually changed
      if (currentUrl !== previousUrl) {
        previousUrl = currentUrl; // Update the previous URL
        const newParams = parseQueryParams(currentUrl);
        setQueryParams(newParams);
      }
    });

    // Observe changes to the URL
    observer.observe(document.querySelector('body')!, {
      childList: true,
      subtree: true
    });

    // Clean up event listeners and observers
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      observer.disconnect();
    };
  }, []);

  // Simply return the query parameters object
  return queryParams;
}