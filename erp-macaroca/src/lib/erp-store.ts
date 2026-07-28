import { supabase } from '@/lib/supabase/client'

export type ErpEnvironment = 'production' | 'test'

export type ErpProfile = {
  id: string
  username: string
  role: 'Admin' | 'Sócia' | 'Comercial' | 'Produção' | 'Financeiro'
  active: boolean
  mustChangePassword: boolean
}

export type AuditEvent = {
  id: number
  environment: ErpEnvironment
  entityType: string
  recordId: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  userName: string
  createdAt: string
  version?: number
}

type ErpRecord = {
  entity_type: string
  record_id: string
  data: Record<string, unknown>
  version: number
  updated_at: string
}

type ChangeResult = {
  entityType: string
  recordId: string
  version?: number
  updatedAt?: string
  deleted?: boolean
}

export type VersionMap = Record<string, number>

const collectionTypes = {
  brands: 'brand',
  rawMaterials: 'raw_material',
  suppliers: 'supplier',
  customers: 'customer',
  products: 'product',
  purchaseNotes: 'purchase_note',
  orders: 'order',
  productionOrders: 'production_order',
  inventoryEntries: 'inventory_entry',
  inventoryCounts: 'inventory_count',
  cashEntries: 'cash_entry',
} as const

const recordKey = (entityType: string, recordId: string) => `${entityType}:${recordId}`

export const usernameEmail = (username: string) => {
  const slug = username
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

  return `${slug}@erp.macaroca.internal`
}

const stateRecords = (state: Record<string, unknown>) => {
  const records = new Map<string, { entityType: string; recordId: string; data: Record<string, unknown> }>()

  Object.entries(collectionTypes).forEach(([stateKey, entityType]) => {
    const collection = Array.isArray(state[stateKey]) ? state[stateKey] as Array<Record<string, unknown>> : []
    collection.forEach((item) => {
      const recordId = String(item.id ?? '')
      if (!recordId) return
      records.set(recordKey(entityType, recordId), { entityType, recordId, data: item })
    })
  })

  const company = (state.company ?? {}) as Record<string, unknown>
  records.set(recordKey('company', 'main'), {
    entityType: 'company',
    recordId: 'main',
    data: company,
  })

  records.set(recordKey('pricing', 'main'), {
    entityType: 'pricing',
    recordId: 'main',
    data: {
      tax: state.tax ?? 0,
      commission: state.commission ?? 0,
      fixedCost: state.fixedCost ?? 0,
      profit: state.profit ?? 0,
    },
  })

  return records
}

export async function loadErpState(
  environment: ErpEnvironment,
  baseState: Record<string, unknown>,
) {
  const [{ data: rows, error: recordsError }, { data: profiles, error: profilesError }, { data: auditRows, error: auditError }] =
    await Promise.all([
      (supabase as any)
        .from('erp_records')
        .select('entity_type, record_id, data, version, updated_at')
        .eq('environment', environment),
      (supabase as any)
        .from('erp_profiles')
        .select('id, username, role, active, must_change_password')
        .eq('active', true)
        .order('username'),
      (supabase as any)
        .from('erp_audit_log')
        .select('id, environment, entity_type, record_id, action, user_name, created_at, record_version')
        .eq('environment', environment)
        .order('created_at', { ascending: false })
        .limit(120),
    ])

  if (recordsError) throw recordsError
  if (profilesError) throw profilesError
  if (auditError) throw auditError

  const nextState = { ...baseState } as Record<string, unknown>
  const records = (rows ?? []) as ErpRecord[]
  const versions: VersionMap = {}

  Object.entries(collectionTypes).forEach(([stateKey, entityType]) => {
    nextState[stateKey] = records
      .filter((row) => row.entity_type === entityType)
      .map((row) => row.data)
  })

  const company = records.find((row) => row.entity_type === 'company' && row.record_id === 'main')
  if (company) nextState.company = company.data

  const pricing = records.find((row) => row.entity_type === 'pricing' && row.record_id === 'main')
  if (pricing) {
    nextState.tax = pricing.data.tax ?? 0
    nextState.commission = pricing.data.commission ?? 0
    nextState.fixedCost = pricing.data.fixedCost ?? 0
    nextState.profit = pricing.data.profit ?? 0
  }

  nextState.users = (profiles ?? []).map((profile: any) => ({
    id: profile.id,
    name: profile.username,
    password: '',
    role: profile.role,
  }))

  records.forEach((row) => {
    versions[recordKey(row.entity_type, row.record_id)] = row.version
  })

  const updatedAt = records.reduce(
    (latest, row) => row.updated_at > latest ? row.updated_at : latest,
    '',
  )

  const audit: AuditEvent[] = (auditRows ?? []).map((row: any) => ({
    id: row.id,
    environment: row.environment,
    entityType: row.entity_type,
    recordId: row.record_id,
    action: row.action,
    userName: row.user_name,
    createdAt: row.created_at,
    version: row.record_version,
  }))

  return { state: nextState, versions, updatedAt, audit }
}

export async function saveErpChanges(
  environment: ErpEnvironment,
  previousState: Record<string, unknown>,
  nextState: Record<string, unknown>,
  versions: VersionMap,
) {
  const previous = stateRecords(previousState)
  const next = stateRecords(nextState)
  const changes: Array<Record<string, unknown>> = []

  next.forEach((record, key) => {
    const existing = previous.get(key)
    if (!existing) {
      changes.push({
        action: 'insert',
        entityType: record.entityType,
        recordId: record.recordId,
        expectedVersion: 0,
        data: record.data,
      })
      return
    }

    if (JSON.stringify(existing.data) !== JSON.stringify(record.data)) {
      changes.push({
        action: 'update',
        entityType: record.entityType,
        recordId: record.recordId,
        expectedVersion: versions[key] ?? 0,
        data: record.data,
      })
    }
  })

  previous.forEach((record, key) => {
    if (next.has(key)) return
    changes.push({
      action: 'delete',
      entityType: record.entityType,
      recordId: record.recordId,
      expectedVersion: versions[key] ?? 0,
    })
  })

  if (!changes.length) return { versions, changed: false }

  const { data, error } = await (supabase as any).rpc('erp_apply_changes', {
    requested_environment: environment,
    changes,
  })

  if (error) throw error

  const nextVersions = { ...versions }
  ;((data ?? []) as ChangeResult[]).forEach((result) => {
    const key = recordKey(result.entityType, result.recordId)
    if (result.deleted) {
      delete nextVersions[key]
    } else if (result.version) {
      nextVersions[key] = result.version
    }
  })

  return { versions: nextVersions, changed: true }
}

export async function loadProfile(userId: string): Promise<ErpProfile> {
  const { data, error } = await (supabase as any)
    .from('erp_profiles')
    .select('id, username, role, active, must_change_password')
    .eq('id', userId)
    .single()

  if (error) throw error

  return {
    id: data.id,
    username: data.username,
    role: data.role,
    active: data.active,
    mustChangePassword: data.must_change_password,
  }
}
