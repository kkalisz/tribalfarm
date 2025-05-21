export function validateTribalWarsUrl(
  currentUrl: string,
  screen: string,
  villageId?: string,
  baseUrl?: string,
  mode?: string
): boolean {
  // Validate inputs
  if (!currentUrl.trim()) {
    throw new Error("Current URL cannot be blank");
  }

  if (villageId && !Number.isInteger(villageId)) {
    throw new Error("Village ID must be a positive integer");
  }
  if (!screen.trim()) {
    throw new Error("Screen name cannot be blank");
  }


  let current: URL;
  try {
    current = new URL(currentUrl.trim());
  } catch (e) {
    throw new Error(`Invalid URL: ${e instanceof Error ? e.message : "Unknown error"}`);
  }

  // Compare hostname and pathname
  if (baseUrl && current.hostname !== baseUrl) {
    return false;
  }

  // Compare relevant query parameters
  const currentParams = new URLSearchParams(current.search);

  // Check required parameters: village and screen
  if(mode && currentParams.get("mode") !== mode) {
    return false;
  }

  if(screen && currentParams.get("screen") !== screen) {
    return false;
  }

  return true;
}