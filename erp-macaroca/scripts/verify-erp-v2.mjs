import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()

async function loadEnv(filename) {
  const content = await readFile(path.join(root, filename), 'utf8')
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

const env = await loadEnv('.env.test')
const latest = (await readFile(path.join(root, 'backups', 'LATEST'), 'utf8')).trim()
const credentialText = await readFile(
  path.join(root, 'backups', latest, 'CREDENCIAIS_TEMPORARIAS_ETAPA1.txt'),
  'utf8',
)
const credentials = [...credentialText.matchAll(/^(.+) \((.+)\)\nSenha temporária: (.+)$/gm)].map(
  ([, name, role, password]) => ({ name, role, password }),
)

const adminCredential = credentials.find((credential) => credential.role === 'Admin')
const partnerCredential = credentials.find((credential) => credential.role === 'Sócia')
if (!adminCredential || !partnerCredential) {
  throw new Error('Credenciais temporárias de Admin e Sócia não foram encontradas.')
}

const client = () =>
  createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

const admin = client()
const partner = client()
const marker = `stage1-${Date.now()}`
const adminCustomerId = `${marker}-customer`
const partnerOrderId = `${marker}-order`

const adminLogin = await admin.auth.signInWithPassword({
  email: usernameEmail(adminCredential.name),
  password: adminCredential.password,
})
if (adminLogin.error) throw adminLogin.error

const adminProfile = await admin
  .from('erp_profiles')
  .select('username, role, active, must_change_password')
  .eq('id', adminLogin.data.user.id)
  .single()
if (adminProfile.error || adminProfile.data.role !== 'Admin') {
  throw adminProfile.error ?? new Error('Perfil administrativo inválido.')
}

console.log('1/8 Autenticação administrativa validada.')
const insertCustomer = await admin.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'insert',
    entityType: 'customer',
    recordId: adminCustomerId,
    expectedVersion: 0,
    data: { id: adminCustomerId, name: 'Cliente de teste da Etapa 1', phone: '', city: '', notes: '' },
  }],
})
if (insertCustomer.error) throw insertCustomer.error
console.log('2/8 Inclusão administrativa validada.')
const insertedVersion = insertCustomer.data[0].version

const updateCustomer = await admin.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'update',
    entityType: 'customer',
    recordId: adminCustomerId,
    expectedVersion: insertedVersion,
    data: { id: adminCustomerId, name: 'Cliente atualizado da Etapa 1', phone: '', city: '', notes: '' },
  }],
})
if (updateCustomer.error) throw updateCustomer.error
console.log('3/8 Atualização com versão validada.')
const currentVersion = updateCustomer.data[0].version

const staleUpdate = await admin.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'update',
    entityType: 'customer',
    recordId: adminCustomerId,
    expectedVersion: insertedVersion,
    data: { id: adminCustomerId, name: 'Esta alteração não pode entrar', phone: '', city: '', notes: '' },
  }],
})
if (!staleUpdate.error || !String(staleUpdate.error.message).includes('CONFLICT')) {
  throw new Error('A proteção contra sobrescrita não bloqueou uma versão antiga.')
}
console.log('4/8 Conflito de edição validado.')

const partnerLogin = await partner.auth.signInWithPassword({
  email: usernameEmail(partnerCredential.name),
  password: partnerCredential.password,
})
if (partnerLogin.error) throw partnerLogin.error
console.log('5/8 Autenticação de Sócia validada.')

const hiddenCash = await partner
  .from('erp_records')
  .select('record_id')
  .eq('environment', 'test')
  .eq('entity_type', 'cash_entry')
if (hiddenCash.error || hiddenCash.data.length !== 0) {
  throw hiddenCash.error ?? new Error('A Sócia recebeu registros financeiros restritos.')
}

const deniedProduct = await partner.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'insert',
    entityType: 'product',
    recordId: `${marker}-denied-product`,
    expectedVersion: 0,
    data: { id: `${marker}-denied-product`, name: 'Produto indevido' },
  }],
})
if (!deniedProduct.error) {
  throw new Error('A Sócia conseguiu cadastrar um produto sem permissão.')
}
console.log('6/8 Restrições da Sócia validadas.')

const allowedOrder = await partner.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'insert',
    entityType: 'order',
    recordId: partnerOrderId,
    expectedVersion: 0,
    data: {
      id: partnerOrderId,
      documentType: 'Pedido',
      client: 'Cliente de teste',
      productId: '',
      qty: 1,
      status: 'Aberto',
    },
  }],
})
if (allowedOrder.error) throw allowedOrder.error
console.log('7/8 Inclusão de pedido pela Sócia validada.')
const partnerOrderVersion = allowedOrder.data[0].version

const deniedDelete = await partner.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [{
    action: 'delete',
    entityType: 'order',
    recordId: partnerOrderId,
    expectedVersion: partnerOrderVersion,
  }],
})
if (!deniedDelete.error) {
  throw new Error('A Sócia conseguiu excluir um pedido sem permissão.')
}

const cleanup = await admin.rpc('erp_apply_changes', {
  requested_environment: 'test',
  changes: [
    {
      action: 'delete',
      entityType: 'customer',
      recordId: adminCustomerId,
      expectedVersion: currentVersion,
    },
    {
      action: 'delete',
      entityType: 'order',
      recordId: partnerOrderId,
      expectedVersion: partnerOrderVersion,
    },
  ],
})
if (cleanup.error) throw cleanup.error
console.log('8/8 Limpeza administrativa validada.')

const audit = await admin
  .from('erp_audit_log')
  .select('record_id, action, user_name')
  .eq('environment', 'test')
  .in('record_id', [adminCustomerId, partnerOrderId])
if (audit.error) throw audit.error
if (!audit.data.some((event) => event.record_id === partnerOrderId && event.user_name === partnerCredential.name)) {
  throw new Error('O histórico não identificou a Sócia que criou o pedido de teste.')
}

const productionLeak = await admin
  .from('erp_records')
  .select('record_id')
  .eq('environment', 'production')
  .in('record_id', [adminCustomerId, partnerOrderId])
if (productionLeak.error || productionLeak.data.length) {
  throw productionLeak.error ?? new Error('O teste alterou o ambiente de produção.')
}

console.log(JSON.stringify({
  valid: true,
  adminAuthentication: true,
  partnerAuthentication: true,
  optimisticConflictBlocked: true,
  financialDataHiddenFromPartner: true,
  unauthorizedProductBlocked: true,
  partnerOrderAllowed: true,
  partnerDeleteBlocked: true,
  auditIdentifiedUser: true,
  testDataCleaned: true,
  productionUntouched: true,
}, null, 2))
