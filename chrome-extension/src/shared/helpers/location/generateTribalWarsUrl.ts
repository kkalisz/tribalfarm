import {getBaseDomain} from "@src/shared/helpers/location/getBaseDomain";

/**
 * Generates a Tribal Wars URL for a specific village and screen.
 *
 * @param baseUrl The server-specific base URL (e.g., "https://pl214.plemiona.pl").
 * @param villageId The ID of the village (e.g., 1794).
 * @param screen The screen name (e.g., "overview", "iron", "place").
 * @param mode Optional sub-screen mode (e.g., "scavenge" for place screen).
 * @returns A formatted URL (e.g., "https://pl214.plemiona.pl/game.php?village=1794&screen=place&mode=scavenge").
 * @throws Error If inputs are invalid.
 */
export function generateTribalWarsUrl(
  baseUrl: string,
  villageId: string,
  screen: string,
  mode?: string
): string {
  // Validate inputs
  if (!baseUrl.trim()) {
    throw new Error("Base URL cannot be blank");
  }
  if (!Number(villageId)) {
    throw new Error(`Village ID must be a positive integer, got ${villageId}`);
  }
  if (!screen.trim()) {
    throw new Error("Screen name cannot be blank");
  }

  // Normalize baseUrl (remove trailing slashes)
  let normalizedBaseUrl: string;
  try {
    normalizedBaseUrl = getBaseDomain(baseUrl)
  } catch (e) {
    throw new Error(`Invalid base URL: ${baseUrl} ${JSON.stringify(e)}`);
  }

  // Build the URL
  let url = `${normalizedBaseUrl}/game.php?village=${villageId}&screen=${screen}`;

  // Append mode if provided and non-empty
  if (mode?.trim()) {
    url += `&mode=${mode.trim()}`;
  }

  return url;
}