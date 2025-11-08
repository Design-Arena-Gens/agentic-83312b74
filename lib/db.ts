import fs from 'fs'
import path from 'path'
import { DatabaseSchema } from './models'

const DATA_FILE = process.env.VERCEL ? '/tmp/documentmanagement-data.json' : path.join(process.cwd(), 'data', 'documentmanagement-data.json')

function ensureDir() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function loadInitial(): DatabaseSchema {
  return {
    users: [],
    documentTypes: [
      { id: 'dt-manual', type: 'Manual', description: 'Quality Manual' },
      { id: 'dt-procedure', type: 'procedure', description: 'Standard Operating Procedure' },
      { id: 'dt-process', type: 'process', description: 'Process Description' },
      { id: 'dt-wi', type: 'work instruction', description: 'Work Instruction' },
      { id: 'dt-policy', type: 'policy', description: 'Policy Document' },
      { id: 'dt-checklist', type: 'checklist', description: 'Checklist' },
      { id: 'dt-format', type: 'format', description: 'Format' },
      { id: 'dt-template', type: 'template', description: 'Template' },
      { id: 'dt-masters', type: 'masters', description: 'Master Records' }
    ],
    documents: [],
    workflows: [
      {
        id: 'wf-default',
        name: 'Default Pharma Workflow',
        category: 'default',
        steps: [
          { id: 's1', name: 'Peer Review', role: 'Reviewer', meaning: 'review' },
          { id: 's2', name: 'Quality Approval', role: 'QA', meaning: 'approval' },
          { id: 's3', name: 'Formal Approval', role: 'Approver', meaning: 'approval' },
          { id: 's4', name: 'Issuance', role: 'Issuer', meaning: 'issuance' }
        ]
      }
    ],
    audit: [],
    signatures: []
  }
}

export function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {
    // ignore and recreate
  }
  const initial = loadInitial()
  try {
    ensureDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2))
  } catch {
    // likely read-only env; fallback to memory-only
  }
  return initial
}

export function writeDb(db: DatabaseSchema): void {
  try {
    ensureDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2))
  } catch {
    // read-only environment, ignore
  }
}
