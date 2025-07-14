import {GameUrlParams} from "@src/shared/helpers/buildUrl";

export function validateTribalWarsUrl(
  currentUrl: string,
  gameUrlParams: GameUrlParams,
  baseUrl?: string,
): boolean {
  // Validate inputs
  if (!currentUrl.trim()) {
    throw new Error("Current URL cannot be blank");
  }

  if (gameUrlParams.village && !Number(gameUrlParams.village)) {
    throw new Error(`Village ID must be a positive integer but is ${gameUrlParams.village}`);
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
  if(gameUrlParams.mode && currentParams.get("mode") !== gameUrlParams.mode) {
    return false;
  }

  if(gameUrlParams.screen && currentParams.get("screen") !== gameUrlParams.screen) {
    return false;
  }

  return true;
}