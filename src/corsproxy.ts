import { extractRoute, formatSlash } from './utils';

// Cloudflare supports the GET, POST, HEAD, and OPTIONS methods from any origin,
// and allow any header on requests. These headers must be present
// on all responses to all CORS preflight requests. In practice, this means this means
// all responses to OPTIONS requests.

// Each key is a route that corsproxy will handle, the value is the API URL
const routeEndpointMap = {
    '/notion': 'https://api.notion.com',
};

// All responses to OPTIONS requests.
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
    'Access-Control-Max-Age': '86400',
};

async function handleRequest(request: Request, apiUrl: string) {
    // Store origin of incoming request for CORS
    const origin = request.headers.get('Origin') || new URL(request.url).origin;

    // Rewrite request to point to API URL. This also makes the request mutable
    // so you can add the correct Origin header to make the API server think
    // that this request is not cross-site.
    request = new Request(apiUrl, request);
    request.headers.set('Origin', new URL(apiUrl).origin);
    let response = await fetch(request);

    // Recreate the response so you can modify the headers
    response = new Response(response.body, response);

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', origin);

    // Append to/Add Vary header so browser will cache response correctly
    response.headers.append('Vary', 'Origin');
    return response;
}

function handleOptions(request: Request) {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    let headers = request.headers;
    if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
    ) {
        // Handle CORS pre-flight request.
        // If you want to check or reject the requested method + headers
        // you can do that here.
        let respHeaders = {
            ...corsHeaders,
            // Allow all future content Request headers to go back to browser
            // such as Authorization (Bearer) or X-Client-Name-Version
            'Access-Control-Allow-Headers':
                request.headers.get('Access-Control-Request-Headers') || '',
        };

        return new Response(null, {
            headers: respHeaders,
        });
    } else {
        // Handle standard OPTIONS request.
        // If you want to allow other HTTP Methods, you can do that here.
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, POST, OPTIONS',
            },
        });
    }
}

function resolveApiUrl(path: string, request: Request) {
    const url = new URL(request.url);
    const apiUrlBase = url.searchParams.get('apiUrlBase');
    if (apiUrlBase) {
        const apiUrl =
            formatSlash(apiUrlBase, false, false) +
            formatSlash(path, true, true);
        return apiUrl;
    }
    for (const [route, apiUrlBase] of Object.entries(routeEndpointMap)) {
        const remainingPath = extractRoute(path, route);
        if (remainingPath) {
            const apiUrl =
                formatSlash(apiUrlBase, false, false) +
                formatSlash(remainingPath, true, true);
            return apiUrl;
        }
    }
    return null;
}

function corsHandler(path: string, request: Request) {
    if (request.method === 'OPTIONS') {
        return handleOptions(request);
    } else if (
        request.method === 'GET' ||
        request.method === 'HEAD' ||
        request.method === 'POST'
    ) {
        const apiUrl = resolveApiUrl(path, request);
        if (!apiUrl) {
            const init = {
                headers: {
                    'Content-Type': 'application/json',
                },
                status: 400,
            };
            const body = JSON.stringify({
                message: `Missing apiUrlBase query parameter`,
            });
            return new Response(body, init);
        }
        return handleRequest(request, apiUrl);
    } else {
        return new Response(null, {
            status: 405,
            statusText: 'Method Not Allowed',
        });
    }
}

export default corsHandler;
