import { cookies } from 'next/headers'
import { getUserFromCookies } from '@/lib/auth'
import { readDb, writeDb } from '@/lib/db'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { recordAudit } from '@/lib/audit'

async function addType(formData: FormData) {
  'use server'
  const user = await getUserFromCookies(cookies())
  if (!user || user.role !== 'Admin') throw new Error('Forbidden')
  const schema = z.object({ type: z.string().min(2), description: z.string().min(2) })
  const v = schema.parse({ type: formData.get('type'), description: formData.get('description') })
  const db = readDb()
  db.documentTypes.unshift({ id: uuidv4(), type: v.type, description: v.description })
  writeDb(db)
  recordAudit({ action: 'create', entity: 'documentType', actorId: user.id, actorName: user.name, actorRole: user.role })
}

export default async function TypesPage() {
  await getUserFromCookies(cookies())
  const db = readDb()
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Document Types</h2>
      <form action={addType} className="card max-w-xl">
        <div className="card-header">Add Type</div>
        <div className="card-body grid md:grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Type</span>
            <input className="input" name="type" required />
          </label>
          <label className="block">
            <span className="label">Description</span>
            <input className="input" name="description" required />
          </label>
          <button className="btn md:col-span-2" type="submit">Create</button>
        </div>
      </form>
      <div className="card">
        <div className="card-body">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Description</th>
              </tr>
            </thead>
            <tbody>
              {db.documentTypes.map(t => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{t.type}</td>
                  <td className="py-2 pr-4">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
