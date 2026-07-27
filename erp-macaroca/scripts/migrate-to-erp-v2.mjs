import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
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

const usernameEmail = (username) => {
  const slug = username
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
  return `${slug}@erp.macaroca.internal`
}

const temporaryPassword = () => {
  const random = randomBytes(12).toString('base64url')
  return `Mc!${random}`
}

const env = await loadEnv('.env.production')
const url = env.VITE_SUPABASE_URL
const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !publishableKey || !serviceRoleKey) {
  throw new Error('Configuração do Supabase ou SUPABASE_SERVICE_ROLE_KEY ausente.')
}

const publicClient = createClient(url, publishableKey, { auth: { persistSession: false } })
const adminClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

const { data: legacyRow, error: legacyError } = await publicClient
  .from('macaroca_app_state')
  .select('state, updated_at')
  .eq('id', 'main')
  .single()

if (legacyError) throw legacyError

const legacyUsers = legacyRow.state.users ?? []
const { data: listedUsers, error: listError } = await adminClient.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
})
if (listError) throw listError

const credentials = []

for (const legacyUser of legacyUsers) {
  const email = usernameEmail(legacyUser.name)
  let authUser = listedUsers.users.find((user) => user.email?.toLowerCase() === email)

  if (!authUser) {
    const password = temporaryPassword()
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: legacyUser.name },
    })
    if (error) throw error
    authUser = data.user
    credentials.push({
      name: legacyUser.name,
      role: legacyUser.role,
      temporaryPassword: password,
    })
  }

  const { error: profileError } = await adminClient
    .from('erp_profiles')
    .upsert({
      id: authUser.id,
      username: legacyUser.name,
      role: legacyUser.role,
      active: true,
      must_change_password: true,
      updated_at: new Date().toISOString(),
    })
  if (profileError) throw profileError
}

const expectedCounts = {
  brand: legacyRow.state.brands?.length ?? 0,
  raw_material: legacyRow.state.rawMaterials?.length ?? 0,
  supplier: legacyRow.state.suppliers?.length ?? 0,
  customer: legacyRow.state.customers?.length ?? 0,
  product: legacyRow.state.products?.length ?? 0,
  purchase_note: legacyRow.state.purchaseNotes?.length ?? 0,
  order: legacyRow.state.orders?.length ?? 0,
  production_order: legacyRow.state.productionOrders?.length ?? 0,
  inventory_entry: legacyRow.state.inventoryEntries?.length ?? 0,
  cash_entry: legacyRow.state.cashEntries?.length ?? 0,
  company: 1,
  pricing: 1,
}

const { data: records, error: recordsError } = await adminClient
  .from('erp_records')
  .select('environment, entity_type, record_id, version')
if (recordsError) throw recordsError

for (const environment of ['production', 'test']) {
  for (const [entityType, expected] of Object.entries(expectedCounts)) {
    const actual = records.filter(
      (row) => row.environment === environment && row.entity_type === entityType,
    ).length
    if (actual !== expected) {
      throw new Error(`${environment}/${entityType}: esperado ${expected}, encontrado ${actual}.`)
    }
  }
}

if (credentials.length) {
  const latestFolder = (await readFile(path.join(projectRoot, 'backups', 'LATEST'), 'utf8')).trim()
  const credentialPath = path.join(
    projectRoot,
    'backups',
    latestFolder,
    'CREDENCIAIS_TEMPORARIAS_ETAPA1.txt',
  )
  await mkdir(path.dirname(credentialPath), { recursive: true })
  await writeFile(
    credentialPath,
    [
      'CREDENCIAIS TEMPORÁRIAS - ERP MAÇAROCA',
      '',
      'Cada pessoa deve trocar esta senha no primeiro acesso.',
      'Não envie todas as senhas no mesmo grupo.',
      '',
      ...credentials.flatMap((credential) => [
        `${credential.name} (${credential.role})`,
        `Senha temporária: ${credential.temporaryPassword}`,
        '',
      ]),
    ].join('\n'),
  )
  await chmod(credentialPath, 0o600)
  console.log(JSON.stringify({ migrated: true, credentialsCreated: credentials.length, credentialPath }, null, 2))
} else {
  console.log(JSON.stringify({ migrated: true, credentialsCreated: 0 }, null, 2))
}
