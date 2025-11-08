import { v4 as uuidv4 } from 'uuid'
import { AuditEvent, User } from './models'
import { readDb, writeDb } from './db'

export function recordAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
  const db = readDb()
  const entry: AuditEvent = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...event,
  }
  db.audit.unshift(entry)
  writeDb(db)
  return entry
}

export function listAudit(limit = 200): AuditEvent[] {
  const db = readDb()
  return db.audit.slice(0, limit)
}
