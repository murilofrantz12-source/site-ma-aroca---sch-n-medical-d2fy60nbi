import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const output = resolve(__dirname, '..', 'dist', 'server', 'index.js')

const worker = `const cacheHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin"
};

const withHeaders = (response) => {
  const headers = new Headers(response.headers);
  Object.entries(cacheHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return withHeaders(assetResponse);
    }

    if (request.method === "GET" && !url.pathname.includes(".")) {
      const indexUrl = new URL("/index.html", request.url);
      return withHeaders(await env.ASSETS.fetch(new Request(indexUrl, request)));
    }

    return withHeaders(assetResponse);
  }
};
`

await mkdir(dirname(output), { recursive: true })
await writeFile(output, worker)
