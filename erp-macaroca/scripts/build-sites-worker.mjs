import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distRoot = resolve(__dirname, '..', 'dist')
const output = resolve(__dirname, '..', 'dist', 'server', 'index.js')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

const files = {}

const walk = async (directory) => {
  const entries = await readdir(directory)

  await Promise.all(entries.map(async (entry) => {
    const fullPath = join(directory, entry)
    const fileStat = await stat(fullPath)
    if (fileStat.isDirectory()) {
      if (relative(distRoot, fullPath).startsWith('server')) return
      if (relative(distRoot, fullPath).startsWith('.openai')) return
      await walk(fullPath)
      return
    }

    const route = `/${relative(distRoot, fullPath).split('/').join('/')}`
    const extension = extname(fullPath)
    const buffer = await readFile(fullPath)
    files[route] = {
      contentType: contentTypes[extension] ?? 'application/octet-stream',
      body: buffer.toString('base64'),
    }
  }))
}

await walk(distRoot)

const worker = `const embeddedFiles = ${JSON.stringify(files)};

const cacheHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin"
};

const decodeBase64 = (value) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const responseForFile = (path, method) => {
  const file = embeddedFiles[path];
  if (!file) return null;
  const headers = new Headers({ "content-type": file.contentType });
  Object.entries(cacheHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(method === "HEAD" ? null : decodeBase64(file.body), { status: 200, headers });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const direct = responseForFile(path, request.method);
    if (direct) return direct;

    if (request.method === "GET" || request.method === "HEAD") {
      const fallback = responseForFile("/index.html", request.method);
      if (fallback && !url.pathname.includes(".")) return fallback;
    }

    return new Response("Not found", { status: 404, headers: cacheHeaders });
  }
};
`

await mkdir(dirname(output), { recursive: true })
await writeFile(output, worker)
