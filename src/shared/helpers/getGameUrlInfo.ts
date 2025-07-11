export type GameUrlInfo = {
  isValid: boolean;
  subdomain?: string;
  fullDomain?: string;
};

export function getGameUrlInfo(url: string): GameUrlInfo {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Regex to match subdomains like pl1, pl123, etc. on plemiona.pl
    const match = hostname.match(/^(pl\d+)\.plemiona\.pl$/);

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