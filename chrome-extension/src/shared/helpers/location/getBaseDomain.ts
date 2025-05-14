export function getBaseDomain(url: string): string {
  const urlWithProtocol = url.startsWith('https') ? url : `https://${url}`;
  // Parse the current location using the URL API
  const { protocol, host } = new URL(urlWithProtocol);

  // Combine protocol and host to form the base URL
  return `${protocol}//${host}`;
}
