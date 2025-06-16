import { useEffect, useState } from "react";

export function useCurrentTabUrl(useTabApi: boolean): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if(!useTabApi){
      setUrl(window.location.href);
      return;
    }
    try {

      if (!chrome?.tabs) {
        console.warn("chrome.tabs is not available");
        return;
      }

      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length > 0 && tabs[0].url) {
          setUrl(tabs[0].url);
        }
      });
    }
    catch (e) {
      console.warn(e);
      return;
    }
  }, []);

  console.log(`url => ${url}`)
  return url;
}
