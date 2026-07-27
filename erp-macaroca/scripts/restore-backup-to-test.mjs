import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()

async function loadEnv(filename) {
  const content = await readFile(path.join(projectRoot, filename), 'utf8')
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=')
        return [line.slice(0, separator), line.slice(separator + 1)]
      }),
  )
}

function stateHash(state) {
  return createHash('sha256').update(JSON.stringify(state, null, 2)).digest('hex')
}

async function getState(url, headers, table) {
  const response = await fetch(`${url}/rest/v1/${table}?id=eq.main&select=id,state,updated_at`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Falha ao consultar ${table}: ${response.status} ${await response.text()}`)
  }

  const [row] = await response.json()
  return row
}

const env = await loadEnv('.env.test')
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY
const testTable = env.VITE_SUPABASE_STATE_TABLE
const productionTable = 'macaroca_app_state'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sao obrigatorios em .env.test.')
}

if (!testTable || testTable === productionTable) {
  throw new Error('Restauracao bloqueada: a tabela de teste nao pode ser a tabela de producao.')
}

const latestFolder = (await readFile(path.join(projectRoot, 'backups', 'LATEST'), 'utf8')).trim()
const backupPath = path.join(projectRoot, 'backups', latestFolder, 'backup-completo-restauravel.json')
const manifestPath = path.join(projectRoot, 'backups', latestFolder, 'manifesto.json')
const backup = JSON.parse(await readFile(backupPath, 'utf8'))
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
}

const productionBefore = await getState(supabaseUrl, headers, productionTable)
if (!productionBefore) {
  throw new Error('Estado de producao nao encontrado.')
}

const restoreResponse = await fetch(`${supabaseUrl}/rest/v1/${testTable}?on_conflict=id`, {
  method: 'POST',
  headers: {
    ...headers,
    Prefer: 'resolution=merge-duplicates,return=minimal',
  },
  body: JSON.stringify({
    id: 'main',
    state: backup.state,
    updated_at: new Date().toISOString(),
  }),
})

if (!restoreResponse.ok) {
  throw new Error(`Falha ao restaurar ambiente de teste: ${restoreResponse.status} ${await restoreResponse.text()}`)
}

const [testAfter, productionAfter] = await Promise.all([
  getState(supabaseUrl, headers, testTable),
  getState(supabaseUrl, headers, productionTable),
])

const expectedHash = manifest.stateSha256
const testHash = stateHash(testAfter.state)
const productionHashBefore = stateHash(productionBefore.state)
const productionHashAfter = stateHash(productionAfter.state)
const productionUntouched =
  productionBefore.updated_at === productionAfter.updated_at &&
  productionHashBefore === productionHashAfter

if (testHash !== expectedHash) {
  throw new Error(`Copia de teste divergente. Esperado ${expectedHash}, recebido ${testHash}.`)
}

if (!productionUntouched) {
  throw new Error('A validacao detectou alteracao inesperada no estado de producao.')
}

console.log(
  JSON.stringify(
    {
      restored: true,
      backup: latestFolder,
      testTable,
      testHash,
      productionUntouched,
      productionUpdatedAt: productionAfter.updated_at,
    },
    null,
    2,
  ),
)
