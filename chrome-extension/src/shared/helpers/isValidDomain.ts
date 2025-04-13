export function isValidDomain(): boolean {
    const hostname = window.location.hostname;

    // Check if it's a plemiona.pl domain
    if (!hostname.endsWith('.plemiona.pl')) {
        return false;
    }

    // Extract the subdomain (everything before .plemiona.pl)
    const subdomain = hostname.substring(0, hostname.length - '.plemiona.pl'.length);

    // Check if subdomain starts with 'pl' and ends with a number
    return /^pl.*\d$/.test(subdomain);
}