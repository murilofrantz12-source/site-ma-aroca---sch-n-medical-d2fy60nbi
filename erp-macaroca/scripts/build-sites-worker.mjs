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

const jsonResponse = (body, status = 200) => {
  const headers = new Headers({
    ...cacheHeaders,
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  return new Response(JSON.stringify(body), { status, headers });
};

const usernameEmail = (username) => {
  const slug = username
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\\.+|\\.+$/g, "");
  return slug + "@erp.macaroca.internal";
};

const handleAdminUser = async (request, env) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: "Configuração segura indisponível." }, 503);
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return jsonResponse({ error: "Sessão obrigatória." }, 401);
  }

  const authHeaders = {
    "apikey": env.SUPABASE_PUBLISHABLE_KEY,
    "authorization": authorization
  };
  const userResponse = await fetch(env.SUPABASE_URL + "/auth/v1/user", { headers: authHeaders });
  if (!userResponse.ok) return jsonResponse({ error: "Sessão inválida." }, 401);
  const currentUser = await userResponse.json();

  const serviceHeaders = {
    "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
    "authorization": "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY,
    "content-type": "application/json"
  };
  const profileResponse = await fetch(
    env.SUPABASE_URL + "/rest/v1/erp_profiles?id=eq." + encodeURIComponent(currentUser.id) + "&select=role,active",
    { headers: serviceHeaders }
  );
  if (!profileResponse.ok) return jsonResponse({ error: "Perfil não encontrado." }, 403);
  const profiles = await profileResponse.json();
  if (profiles[0]?.role !== "Admin" || profiles[0]?.active !== true) {
    return jsonResponse({ error: "Somente administradores podem criar usuários." }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Dados inválidos." }, 400);
  }

  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  const allowedRoles = ["Admin", "Sócia", "Comercial", "Produção", "Financeiro"];
  const role = allowedRoles.includes(body.role) ? body.role : "Sócia";

  if (!name || password.length < 8) {
    return jsonResponse({ error: "Informe o nome e uma senha com pelo menos 8 caracteres." }, 400);
  }

  const createResponse = await fetch(env.SUPABASE_URL + "/auth/v1/admin/users", {
    method: "POST",
    headers: serviceHeaders,
    body: JSON.stringify({
      email: usernameEmail(name),
      password,
      email_confirm: true,
      user_metadata: { username: name }
    })
  });
  const created = await createResponse.json();
  if (!createResponse.ok) {
    const detail = String(created.msg || created.message || "Não foi possível criar o usuário.");
    return jsonResponse({ error: detail.includes("already") ? "Já existe um usuário com esse nome." : detail }, 409);
  }

  const profileWrite = await fetch(env.SUPABASE_URL + "/rest/v1/erp_profiles?on_conflict=id", {
    method: "POST",
    headers: {
      ...serviceHeaders,
      "prefer": "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify({
      id: created.id,
      username: name,
      role,
      active: true,
      must_change_password: true,
      updated_at: new Date().toISOString()
    })
  });
  const savedProfiles = await profileWrite.json();
  if (!profileWrite.ok) {
    await fetch(env.SUPABASE_URL + "/auth/v1/admin/users/" + created.id, {
      method: "DELETE",
      headers: serviceHeaders
    });
    return jsonResponse({ error: "Não foi possível concluir o cadastro." }, 500);
  }

  return jsonResponse({
    user: {
      id: savedProfiles[0].id,
      name: savedProfiles[0].username,
      role: savedProfiles[0].role
    }
  }, 201);
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/admin/users" && request.method === "POST") {
      return handleAdminUser(request, env);
    }

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
