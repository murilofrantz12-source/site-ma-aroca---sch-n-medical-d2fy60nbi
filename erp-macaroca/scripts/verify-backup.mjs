import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const projectDir = process.cwd()
const backupRoot = path.join(projectDir, 'backups')
const requestedFolder = process.argv[2]
const folder =
  requestedFolder || (await readFile(path.join(backupRoot, 'LATEST'), 'utf8')).trim()
const backupDir = path.isAbsolute(folder) ? folder : path.join(backupRoot, folder)

const payload = JSON.parse(
  await readFile(path.join(backupDir, 'backup-completo-restauravel.json'), 'utf8'),
)
const manifest = JSON.parse(await readFile(path.join(backupDir, 'manifesto.json'), 'utf8'))

if (payload.format !== 'macaroca-erp-backup-v1') {
  throw new Error('Formato de backup não reconhecido.')
}

const stateHash = createHash('sha256')
  .update(JSON.stringify(payload.state, null, 2))
  .digest('hex')

if (stateHash !== manifest.stateSha256) {
  throw new Error('O conteúdo do backup foi alterado ou está corrompido.')
}

const actualCounts = Object.fromEntries(
  Object.keys(manifest.counts).map((collection) => [
    collection,
    Array.isArray(payload.state[collection]) ? payload.state[collection].length : 0,
  ]),
)

for (const [collection, expected] of Object.entries(manifest.counts)) {
  if (actualCounts[collection] !== expected) {
    throw new Error(
      `Contagem inválida em ${collection}: esperado ${expected}, encontrado ${actualCounts[collection]}.`,
    )
  }
}

console.log(
  JSON.stringify(
    {
      valid: true,
      backupDir,
      stateSha256: stateHash,
      counts: actualCounts,
    },
    null,
    2,
  ),
)
