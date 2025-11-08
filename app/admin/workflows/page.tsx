import { cookies } from 'next/headers'
import { getUserFromCookies } from '@/lib/auth'
import { readDb, writeDb } from '@/lib/db'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { recordAudit } from '@/lib/audit'

async function addWorkflow(formData: FormData) {
  'use server'
  const user = await getUserFromCookies(cookies())
  if (!user || user.role !== 'Admin') throw new Error('Forbidden')
  const schema = z.object({ name: z.string().min(3), category: z.string().min(2) })
  const v = schema.parse({ name: formData.get('name'), category: formData.get('category') })
  const db = readDb()
  db.workflows.unshift({ id: uuidv4(), name: v.name, category: v.category, steps: [] })
  writeDb(db)
  recordAudit({ action: 'create', entity: 'workflow', actorId: user.id, actorName: user.name, actorRole: user.role })
}

export default async function WorkflowsPage() {
  const user = await getUserFromCookies(cookies())
  const db = readDb()
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Workflows</h2>
      {user?.role === 'Admin' && (
        <form action={addWorkflow} className="card max-w-xl">
          <div className="card-header">Add Workflow</div>
          <div className="card-body grid md:grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Name</span>
              <input className="input" name="name" required />
            </label>
            <label className="block">
              <span className="label">Category</span>
              <input className="input" name="category" required />
            </label>
            <button className="btn md:col-span-2" type="submit">Create</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-body">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Steps</th>
              </tr>
            </thead>
            <tbody>
              {db.workflows.map(w => (
                <tr key={w.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{w.name}</td>
                  <td className="py-2 pr-4">{w.category}</td>
                  <td className="py-2 pr-4">{w.steps.map(s => s.name).join(', ') || '?'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
