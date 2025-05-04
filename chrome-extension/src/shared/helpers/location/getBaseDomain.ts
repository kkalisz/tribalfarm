export function getBaseDomain(url: string): string {
  // Parse the current location using the URL API
  const { protocol, host } = new URL(url);

  // Combine protocol and host to form the base URL
  return `${protocol}//${host}`;
}
