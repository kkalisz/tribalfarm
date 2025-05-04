import {generateTribalWarsUrl} from "@src/shared/helpers/location/generateTribalWarsUrl";

export function validateTribalWarsUrl(
  currentUrl: string,
  baseUrl: string,
  villageId: string,
  screen: string,
  mode?: string
): boolean {
  // Validate inputs
  if (!currentUrl.trim()) {
    throw new Error("Current URL cannot be blank");
  }
  if (!baseUrl.trim()) {
    throw new Error("Base URL cannot be blank");
  }
  if (!Number.isInteger(villageId)) {
    throw new Error("Village ID must be a positive integer");
  }
  if (!screen.trim()) {
    throw new Error("Screen name cannot be blank");
  }

  // Generate the expected URL
  const expectedUrl = generateTribalWarsUrl(baseUrl, villageId, screen, mode);

  // Normalize and parse URLs for comparison
  let current: URL;
  let expected: URL;
  try {
    current = new URL(currentUrl.trim());
    expected = new URL(expectedUrl);
  } catch (e) {
    throw new Error(`Invalid URL: ${e instanceof Error ? e.message : "Unknown error"}`);
  }

  // Compare hostname and pathname
  if (current.hostname !== expected.hostname || current.pathname !== expected.pathname) {
    return false;
  }

  // Compare relevant query parameters
  const currentParams = new URLSearchParams(current.search);
  const expectedParams = new URLSearchParams(expected.search);

  // Check required parameters: village and screen
  if (
    currentParams.get("village") !== expectedParams.get("village") ||
    currentParams.get("screen") !== expectedParams.get("screen")
  ) {
    return false;
  }

  // Check mode parameter if provided
  if (mode?.trim()) {
    if (currentParams.get("mode") !== expectedParams.get("mode")) {
      return false;
    }
  } else {
    // If mode is not provided, ensure it’s absent or empty in current URL
    if (currentParams.get("mode") && currentParams.get("mode") !== "") {
      return false;
    }
  }

  return true;
}