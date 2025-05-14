import {getBaseDomain} from "@src/shared/helpers/location/getBaseDomain";

export interface GameUrlParams{
  village?: string | undefined
  screen: string;
  mode?: string | undefined;
}

export function buildGameUrlWithScreen(
  baseUrl: string,
  gameUrlParams: GameUrlParams,
  params: Record<string, string | number | null | undefined>
): string {
  const combinedParams: Record<string, string | number | null | undefined> = {
    ...gameUrlParams,
    ...params, // Spread the rest of the params
  };

  return buildGameUrl(baseUrl, combinedParams); // Invoke buildGameUrl
}


export function buildGameUrl(baseUrl: string, params: Record<string, string | number | null | undefined>): string {
  return buildUrl(baseUrl, 'game.php', params);
}

export function buildUrl(baseUrl: string, path: string, params: Record<string, string | number | null | undefined>): string {
  const basUrlParts = getBaseDomain(baseUrl)
  const queryString = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined) // Filter out null/undefined values
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`) // Encode and format
    .join('&'); // Join with '&' to construct the query string

  return queryString ? `${basUrlParts}/${path}?${queryString}` : `${basUrlParts}/${path}`;
}