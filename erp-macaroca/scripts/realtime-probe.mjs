import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const envText = await readFile(path.join(root, '.env.test'), 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator), line.slice(separator + 1)]
    }),
)
const latest = (await readFile(path.join(root, 'backups', 'LATEST'), 'utf8')).trim()
const credentialText = await readFile(
  path.join(root, 'backups', latest, 'CREDENCIAIS_TEMPORARIAS_ETAPA1.txt'),
  'utf8',
)
const adminMatch = [...credentialText.matchAll(/^(.+) \(Admin\)\nSenha temporária: (.+)$/gm)][0]
if (!adminMatch) throw new Error('Credencial administrativa temporária não encontrada.')

const email = `${adminMatch[1]
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '.')
  .replace(/^\.+|\.+$/g, '')}@erp.macaroca.internal`
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const login = await client.auth.signInWithPassword({ email, password: adminMatch[2] })
if (login.error) throw login.error

const id = `realtime-probe-${Date.now()}`
const insert = await client.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'insert',
    entityType: 'customer',
    recordId: id,
    expectedVersion: 0,
    data: { id, name: 'Teste de sincronização entre aparelhos', phone: '', city: '', notes: '' },
  }],
})
if (insert.error) throw insert.error
console.log(JSON.stringify({ phase: 'inserted', id }))

await new Promise((resolve) => setTimeout(resolve, 15000))

const remove = await client.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'delete',
    entityType: 'customer',
    recordId: id,
    expectedVersion: insert.data[0].version,
  }],
})
if (remove.error) throw remove.error
console.log(JSON.stringify({ phase: 'removed', id }))
