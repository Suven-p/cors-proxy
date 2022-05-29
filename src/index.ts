import corsHandler from './corsproxy';
import { extractRoute } from './utils';

// Map route to route handler
type RouteHandler = (
    unusedPath: string,
    request: Request
) => Response | Promise<Response>;
const routesMap: {
    [endpoint: string]: RouteHandler;
} = {
    corsproxy: corsHandler,
};

export default {
    fetch(request: Request) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        for (const [key, value] of Object.entries(routesMap)) {
            const remainingPath = extractRoute(pathname, key);
            if (remainingPath !== null) {
                return value(remainingPath, request);
            }
        }
        return new Response(null, {
            status: 404,
            statusText: 'Not Found',
        });
    },
};
