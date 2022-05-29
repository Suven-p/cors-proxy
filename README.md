# CORS Proxy

This is a cloudflare worker designed to allow access to api which do not have CORS enabled.

### Setup

-   Setup wrangler:

```bash
npm install # or yarn install
npx wrangler login
```

-   Start dev worker:

```bash
npm run dev # or yarn dev
```

To deploy to production, consult [Cloudflare Worker documentation](https://6b05b6e1.cloudflare-docs-7ou.pages.dev/workers/get-started/guide).

## Usage

-   ### Generic requests
    Use apiUrlBase search param.

```js
// Proxy request to https://api.example.com
const url =
    'http://your-worker-url.com/corsproxy?apiUrlBase=https://api.example.com';
fetch(url)
    .then((data) => data.text())
    .then((data) => console.log(data));
```

```js
// Proxy request to https://api.example.com/users/me
const url =
    'http://your-worker-url.com/corsproxy/users/me?apiUrlBase=https://api.example.com';
fetch(url)
    .then((data) => data.text())
    .then((data) => console.log(data));
```

-   ### Notion JS Client
    Pass your worker url as baseUrl to Client initialization.

```js
const { Client } = require('@notionhq/client');

const baseApiUrl = 'https://your-worker-url.com/corsproxy/notion';
const client = new Client({ baseUrl: baseApiUrl, ...other_options });
```

-   ### Notion HTTP Requests
    Send a request to _your-worker-url_/cors-proxy/notion/_notion_endpoint_.
    If wrangler is listening at localhost:8787, send request to http://localhost:8787/corsproxy/notion/v1/users to access notion's users endpoint.
