export type GameUrlInfo = {
  isValid: boolean;
  subdomain?: string;
  fullDomain?: string;
};

export function getGameUrlInfo(url: string): GameUrlInfo {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Regex to match subdomains that start with "pl" on plemiona.pl
    const match = hostname.match(/^(pl[a-zA-Z0-9]+)\.plemiona\.pl$/);

    if (match) {
      const subdomain = match[1];
      return {
        isValid: true,
        subdomain,
        fullDomain: `${subdomain}.plemiona.pl`,
      };
    }

    return { isValid: false };
  } catch (e) {
    return { isValid: false };
  }
}