import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { getUserFromCookies } from '@/lib/auth'
import { readDb, writeDb } from '@/lib/db'
import { recordAudit } from '@/lib/audit'
import { v4 as uuidv4 } from 'uuid'

async function submitForReview(id: string) {
  'use server'
  const user = await getUserFromCookies(cookies())
  if (!user) throw new Error('Unauthorized')
  const db = readDb()
  const doc = db.documents.find(d => d.id === id)
  if (!doc) throw new Error('Not found')
  doc.lifecycle = 'In Review'
  writeDb(db)
  recordAudit({ action: 'submit_for_review', entity: 'document', entityId: id, actorId: user.id, actorName: user.name, actorRole: user.role })
  redirect(`/documents/${id}`)
}

async function bumpVersion(id: string) {
  'use server'
  const user = await getUserFromCookies(cookies())
  if (!user) throw new Error('Unauthorized')
  const db = readDb()
  const doc = db.documents.find(d => d.id === id)
  if (!doc) throw new Error('Not found')
  const [major, minor] = doc.documentVersion.split('.').map(Number)
  const newVersion = `${major}.${minor + 1}`
  doc.documentVersion = newVersion
  doc.versions.unshift({ version: newVersion, title: doc.title, createdAt: new Date().toISOString(), createdBy: user.name })
  doc.lifecycle = 'Draft'
  writeDb(db)
  recordAudit({ action: 'new_version', entity: 'document', entityId: id, actorId: user.id, actorName: user.name, actorRole: user.role, details: { version: newVersion } })
  redirect(`/documents/${id}`)
}

async function applySignature(id: string, formData: FormData) {
  'use server'
  const user = await getUserFromCookies(cookies())
  if (!user) throw new Error('Unauthorized')
  const schema = z.object({ meaning: z.enum(['review','approval','issuance','change','retire']), reason: z.string().optional() })
  const v = schema.parse({ meaning: formData.get('meaning'), reason: formData.get('reason') })
  const db = readDb()
  const doc = db.documents.find(d => d.id === id)
  if (!doc) throw new Error('Not found')
  const bcrypt = await import('bcryptjs')
  const hash = bcrypt.hashSync(`${user.id}|${user.role}|${v.meaning}|${doc.documentNumber}|${doc.documentVersion}|${new Date().toISOString()}`, 8)
  db.signatures.unshift({ id: uuidv4(), documentId: id, userId: user.id, userName: user.name, role: user.role, meaning: v.meaning, reason: v.reason, signedAt: new Date().toISOString(), hash })
  // lifecycle transitions
  if (v.meaning === 'approval') {
    doc.lifecycle = 'Approved'
  } else if (v.meaning === 'issuance') {
    doc.lifecycle = 'Effective'
    doc.dateOfIssue = new Date().toISOString()
    doc.issuedBy = user.name
    doc.issuerRole = user.role
  } else if (v.meaning === 'retire') {
    doc.lifecycle = 'Obsolete'
  }
  writeDb(db)
  recordAudit({ action: `e_signature_${v.meaning}` , entity: 'document', entityId: id, actorId: user.id, actorName: user.name, actorRole: user.role })
  redirect(`/documents/${id}`)
}

export default async function DocumentDetail({ params }: { params: { id: string } }) {
  const user = await getUserFromCookies(cookies())
  const db = readDb()
  const doc = db.documents.find(d => d.id === params.id)
  if (!doc) return notFound()
  const signatures = db.signatures.filter(s => s.documentId === doc.id)
  const workflow = db.workflows[0]

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{doc.title}</h2>
          <p className="text-sm text-slate-600">{doc.documentNumber} ? v{doc.documentVersion} ? {doc.lifecycle}</p>
        </div>
        <div className="flex gap-2">
          <form action={submitForReview.bind(null, doc.id)}>
            <button className="btn-secondary" type="submit">Submit for Review</button>
          </form>
          <form action={bumpVersion.bind(null, doc.id)}>
            <button className="btn-secondary" type="submit">New Minor Version</button>
          </form>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">Metadata</div>
          <div className="card-body grid grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium">Type:</span> {doc.documentType}</div>
            <div><span className="font-medium">Category:</span> {doc.documentCategory}</div>
            <div><span className="font-medium">Security:</span> {doc.documentSecurity}</div>
            <div><span className="font-medium">Created:</span> {new Date(doc.dateCreated).toLocaleString()}</div>
            {doc.dateOfIssue && <div><span className="font-medium">Issued:</span> {new Date(doc.dateOfIssue).toLocaleString()}</div>}
            {doc.issuedBy && <div><span className="font-medium">Issued By:</span> {doc.issuedBy} ({doc.issuerRole})</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header">Versions</div>
          <div className="card-body">
            <ul className="list-disc pl-6">
              {doc.versions.map(v => (
                <li key={v.version} className="mb-1">v{v.version} ? {v.title} ? {new Date(v.createdAt).toLocaleString()} by {v.createdBy}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Workflow & E-Signature</div>
        <div className="card-body">
          <div className="mb-4 text-sm text-slate-700">Required steps:
            <ul className="list-disc pl-6">
              {workflow.steps.map(s => <li key={s.id}>{s.name} ? role {s.role} ({s.meaning})</li>)}
            </ul>
          </div>
          <form action={applySignature.bind(null, doc.id)} className="grid md:grid-cols-3 gap-3 items-end">
            <label className="block">
              <span className="label">Meaning</span>
              <select name="meaning" className="input">
                <option value="review">review</option>
                <option value="approval">approval</option>
                <option value="issuance">issuance</option>
                <option value="change">change</option>
                <option value="retire">retire</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="label">Reason (optional)</span>
              <input className="input" name="reason" placeholder="Justification / comments" />
            </label>
            <button className="btn" type="submit">Apply Signature</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Signatures</div>
        <div className="card-body">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Meaning</th>
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Hash</th>
              </tr>
            </thead>
            <tbody>
              {signatures.map(s => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{s.userName}</td>
                  <td className="py-2 pr-4">{s.role}</td>
                  <td className="py-2 pr-4">{s.meaning}</td>
                  <td className="py-2 pr-4">{new Date(s.signedAt).toLocaleString()}</td>
                  <td className="py-2 pr-4 font-mono text-xs truncate max-w-[260px]" title={s.hash}>{s.hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
