import { cookies } from 'next/headers'
import { getUserFromCookies } from '@/lib/auth'
import { readDb, writeDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { recordAudit } from '@/lib/audit'

async function createDocument(formData: FormData) {
  'use server'
  const user = await getUserFromCookies(cookies())
  if (!user) throw new Error('Unauthorized')
  const schema = z.object({
    title: z.string().min(3),
    documentNumber: z.string().min(2),
    documentType: z.enum(['Manual','procedure','process','work instruction','policy','checklist','format','template','masters']),
    documentCategory: z.string().min(2),
    documentSecurity: z.enum(['confidential','internal','restricted','public'])
  })
  const v = schema.parse({
    title: formData.get('title'),
    documentNumber: formData.get('documentNumber'),
    documentType: formData.get('documentType'),
    documentCategory: formData.get('documentCategory'),
    documentSecurity: formData.get('documentSecurity'),
  })
  const db = readDb()
  const now = new Date().toISOString()
  const id = uuidv4()
  const doc = {
    id,
    title: v.title,
    documentNumber: v.documentNumber,
    documentVersion: '1.0',
    dateCreated: now,
    createdBy: user.name,
    documentType: v.documentType,
    documentCategory: v.documentCategory,
    documentSecurity: v.documentSecurity,
    lifecycle: 'Draft' as const,
    versions: [{ version: '1.0', title: v.title, createdAt: now, createdBy: user.name }]
  }
  db.documents.unshift(doc)
  writeDb(db)
  recordAudit({ action: 'create', entity: 'document', entityId: id, actorId: user.id, actorName: user.name, actorRole: user.role, details: { title: v.title, number: v.documentNumber } })
  redirect(`/documents/${id}`)
}

export default async function NewDocumentPage() {
  const db = readDb()
  await getUserFromCookies(cookies())
  return (
    <form action={createDocument} className="grid gap-4 max-w-3xl">
      <div className="card">
        <div className="card-header">New Document</div>
        <div className="card-body grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Title</span>
            <input name="title" className="input" required />
          </label>
          <label className="block">
            <span className="label">Document Number</span>
            <input name="documentNumber" className="input" required />
          </label>
          <label className="block">
            <span className="label">Document Type</span>
            <select name="documentType" className="input">
              {db.documentTypes.map(dt => (
                <option key={dt.id} value={dt.type}>{dt.type}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">Category</span>
            <input name="documentCategory" className="input" placeholder="e.g., Quality, Manufacturing" required />
          </label>
          <label className="block">
            <span className="label">Security</span>
            <select name="documentSecurity" className="input">
              <option value="confidential">confidential</option>
              <option value="internal">internal</option>
              <option value="restricted">restricted</option>
              <option value="public">public</option>
            </select>
          </label>
        </div>
      </div>
      <div>
        <button className="btn" type="submit">Create</button>
      </div>
    </form>
  )
}
