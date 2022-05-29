export function extractRoute(url: string, route: string): string | null {
    url = formatSlash(url, true, true);
    route = formatSlash(route, true, false);
    if (url.search(route) === 0) {
        const remaining = url.replace(route, '');
        return formatSlash(remaining, true, true);
    }
    return null;
}

export function formatSlash(url: string, start: boolean, end: boolean): string {
    if (start && !url.startsWith('/')) {
        url = '/' + url;
    } else if (start === false && url.startsWith('/')) {
        url = url.slice(1);
    }
    if (end && !url.endsWith('/')) {
        url = url + '/';
    } else if (end === false && url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    return url;
}
