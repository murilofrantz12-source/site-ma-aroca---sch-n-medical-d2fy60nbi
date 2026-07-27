import { createHash } from 'node:crypto'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const projectDir = process.cwd()
const envFile = path.join(projectDir, '.env')
const backupRoot = path.join(projectDir, 'backups')

const parseEnv = (text) =>
  Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=')
        return [line.slice(0, separator), line.slice(separator + 1)]
      }),
  )

const safeTimestamp = (date) => date.toISOString().replace(/[:.]/g, '-')
const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const csvValue = (value) => {
  const printable =
    value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
  return `"${printable.replaceAll('"', '""')}"`
}

const rowsToCsv = (rows) => {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  return [
    headers.map(csvValue).join(','),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(',')),
  ].join('\n')
}

const duplicateValues = (rows, field) => {
  const grouped = new Map()
  for (const row of rows) {
    const value = normalize(row[field])
    if (!value) continue
    const existing = grouped.get(value) ?? []
    existing.push(row.id ?? row[field])
    grouped.set(value, existing)
  }
  return [...grouped.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([value, ids]) => ({ field, value, ids }))
}

const checkReferences = (state) => {
  const problems = []
  const productIds = new Set((state.products ?? []).map((item) => item.id))
  const customerIds = new Set((state.customers ?? []).map((item) => item.id))
  const materialIds = new Set((state.rawMaterials ?? []).map((item) => item.id))
  const orderIds = new Set((state.orders ?? []).map((item) => item.id))

  for (const order of state.orders ?? []) {
    if (!productIds.has(order.productId)) {
      problems.push(`Pedido ${order.id}: produto ${order.productId} não existe.`)
    }
    if (order.customerId && !customerIds.has(order.customerId)) {
      problems.push(`Pedido ${order.id}: cliente ${order.customerId} não existe.`)
    }
  }

  for (const op of state.productionOrders ?? []) {
    if (!productIds.has(op.productId)) {
      problems.push(`OP ${op.id}: produto ${op.productId} não existe.`)
    }
    if (op.orderId && !orderIds.has(op.orderId)) {
      problems.push(`OP ${op.id}: pedido ${op.orderId} não existe.`)
    }
    if (Number(op.produced) > Number(op.qty)) {
      problems.push(`OP ${op.id}: quantidade produzida é maior que a planejada.`)
    }
  }

  for (const product of state.products ?? []) {
    const materialLines = [
      ...(product.materials ?? []),
      ...(product.variations ?? []).flatMap((variation) => variation.materials ?? []),
    ]
    for (const material of materialLines) {
      if (material.rawMaterialId && !materialIds.has(material.rawMaterialId)) {
        problems.push(
          `Produto ${product.code}: matéria-prima ${material.rawMaterialId} não existe.`,
        )
      }
    }
  }

  return problems
}

const checkNumericValues = (state) => {
  const problems = []
  const checks = [
    ['Matéria-prima', state.rawMaterials, ['purchaseToStockFactor', 'avgCost', 'minimumStock']],
    ['Produto', state.products, ['salePrice']],
    ['Pedido', state.orders, ['qty', 'unitPrice']],
    ['OP', state.productionOrders, ['qty', 'produced']],
    ['Nota', state.purchaseNotes, ['qty', 'unitCost']],
    ['Estoque', state.inventoryEntries, ['qty', 'value']],
    ['Financeiro', state.cashEntries, ['value']],
  ]

  for (const [label, rows = [], fields] of checks) {
    for (const row of rows ?? []) {
      for (const field of fields) {
        if (row[field] != null && Number(row[field]) < 0) {
          problems.push(`${label} ${row.id ?? row.name}: ${field} está negativo.`)
        }
      }
    }
  }

  return problems
}

const permissionMatrix = {
  Admin: 'Acesso total ao sistema.',
  Sócia: 'Vendas, entregas, produção, estoque, clientes, conta e ajuda.',
  Comercial: 'Vendas, entregas, clientes, consulta de estoque, conta e ajuda.',
  Produção: 'Necessidades, OPs, registro de produção, estoque, conta e ajuda.',
  Financeiro: 'Vendas, compras, estoque, fornecedores, preços, financeiro, conta e ajuda.',
}

const env = parseEnv(await readFile(envFile, 'utf8'))
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórios.')
}

const response = await fetch(
  `${url}/rest/v1/macaroca_app_state?id=eq.main&select=id,state,updated_at`,
  {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  },
)

if (!response.ok) {
  throw new Error(`Falha ao buscar o estado compartilhado: ${response.status}.`)
}

const [record] = await response.json()
if (!record?.state) throw new Error('O estado compartilhado principal não foi encontrado.')

const createdAt = new Date()
const folderName = safeTimestamp(createdAt)
const backupDir = path.join(backupRoot, folderName)
await mkdir(backupDir, { recursive: true })

const stateJson = JSON.stringify(record.state, null, 2)
const backupPayload = JSON.stringify(
  {
    format: 'macaroca-erp-backup-v1',
    exportedAt: createdAt.toISOString(),
    source: {
      table: 'macaroca_app_state',
      id: record.id,
      updatedAt: record.updated_at,
    },
    state: record.state,
  },
  null,
  2,
)
const stateHash = createHash('sha256').update(stateJson).digest('hex')

const fullBackupFile = path.join(backupDir, 'backup-completo-restauravel.json')
await writeFile(fullBackupFile, backupPayload, { mode: 0o600 })
await chmod(fullBackupFile, 0o600)

const collections = [
  'orders',
  'products',
  'customers',
  'rawMaterials',
  'productionOrders',
  'users',
  'inventoryEntries',
  'purchaseNotes',
  'suppliers',
  'cashEntries',
  'brands',
]

for (const collection of collections) {
  const rows = Array.isArray(record.state[collection]) ? record.state[collection] : []
  const safeRows =
    collection === 'users'
      ? rows.map(({ password: _password, ...user }) => ({
          ...user,
          password: 'OMITIDA - disponível apenas no backup completo protegido',
        }))
      : rows
  await writeFile(
    path.join(backupDir, `${collection}.csv`),
    `\ufeff${rowsToCsv(safeRows)}`,
    'utf8',
  )
}

const duplicateChecks = [
  ['users', 'name'],
  ['brands', 'name'],
  ['brands', 'prefix'],
  ['products', 'code'],
  ['customers', 'name'],
  ['suppliers', 'name'],
  ['rawMaterials', 'name'],
  ['rawMaterials', 'code'],
]

const duplicates = duplicateChecks.flatMap(([collection, field]) =>
  duplicateValues(record.state[collection] ?? [], field).map((item) => ({
    collection,
    ...item,
  })),
)
const referenceProblems = checkReferences(record.state)
const numericProblems = checkNumericValues(record.state)
const counts = Object.fromEntries(
  collections.map((collection) => [
    collection,
    Array.isArray(record.state[collection]) ? record.state[collection].length : 0,
  ]),
)

const manifest = {
  format: 'macaroca-erp-backup-manifest-v1',
  createdAt: createdAt.toISOString(),
  sourceUpdatedAt: record.updated_at,
  stateSha256: stateHash,
  counts,
  files: [
    'backup-completo-restauravel.json',
    ...collections.map((collection) => `${collection}.csv`),
    'diagnostico.md',
    'COMO_RESTAURAR.txt',
  ],
}

await writeFile(
  path.join(backupDir, 'manifesto.json'),
  JSON.stringify(manifest, null, 2),
  'utf8',
)

const diagnosis = `# Diagnóstico do ERP Maçaroca

Gerado em: ${createdAt.toLocaleString('pt-BR')}

## Onde os dados estão

- Supabase: fonte compartilhada principal, tabela \`macaroca_app_state\`, registro \`main\`.
- Navegador: mantém uma cópia local em \`macaroca-erp-prototype-v2\` para funcionamento temporário sem conexão.
- Regra atual: o Supabase é a fonte compartilhada; o navegador funciona como cópia de apoio.
- Atenção: o estado ainda está concentrado em um único documento JSON.

## Quantidades encontradas

${Object.entries(counts)
  .map(([name, count]) => `- ${name}: ${count}`)
  .join('\n')}

## Duplicidades

${
  duplicates.length
    ? duplicates
        .map(
          (item) =>
            `- ${item.collection}.${item.field}: "${item.value}" aparece em ${item.ids.join(', ')}.`,
        )
        .join('\n')
    : '- Nenhuma duplicidade direta encontrada nos campos verificados.'
}

## Referências e consistência

${
  [...referenceProblems, ...numericProblems].length
    ? [...referenceProblems, ...numericProblems].map((item) => `- ${item}`).join('\n')
    : '- Nenhuma referência quebrada ou quantidade negativa encontrada.'
}

## Perfis e acessos

${Object.entries(permissionMatrix)
  .map(([role, detail]) => `- ${role}: ${detail}`)
  .join('\n')}

## Riscos identificados

- O backup completo contém as senhas atuais porque elas ainda fazem parte do estado do aplicativo.
- Os CSVs omitem as senhas.
- O armazenamento em um único JSON pode causar conflitos quando duas pessoas salvam ao mesmo tempo.
- A autenticação atual deve ser substituída por autenticação segura na Etapa 1.
`

await writeFile(path.join(backupDir, 'diagnostico.md'), diagnosis, 'utf8')

await writeFile(
  path.join(backupDir, 'COMO_RESTAURAR.txt'),
  `BACKUP DO ERP MAÇAROCA

Arquivo restaurável: backup-completo-restauravel.json
Hash SHA-256 do estado: ${stateHash}

Antes de restaurar:
1. Não altere o arquivo JSON.
2. Execute primeiro a restauração no ambiente de teste.
3. Confira as quantidades do manifesto.json.
4. Somente um administrador pode autorizar restauração na base principal.

Este backup contém senhas do sistema atual. Mantenha a pasta em local privado.
`,
  'utf8',
)

await writeFile(
  path.join(backupRoot, 'LATEST'),
  `${folderName}\n`,
  'utf8',
)

console.log(
  JSON.stringify(
    {
      backupDir,
      createdAt: createdAt.toISOString(),
      sourceUpdatedAt: record.updated_at,
      stateSha256: stateHash,
      counts,
      duplicates: duplicates.length,
      consistencyProblems: referenceProblems.length + numericProblems.length,
    },
    null,
    2,
  ),
)
