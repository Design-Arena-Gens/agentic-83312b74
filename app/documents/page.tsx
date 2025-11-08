import Link from 'next/link'
import { cookies } from 'next/headers'
import { getUserFromCookies } from '@/lib/auth'
import { readDb } from '@/lib/db'

export default async function DocumentsPage() {
  const user = await getUserFromCookies(cookies())
  const db = readDb()
  const docs = db.documents.filter(d => {
    if (!user) return d.documentSecurity === 'public'
    if (d.documentSecurity === 'confidential') return ['Admin','QA'].includes(user.role)
    if (d.documentSecurity === 'restricted') return ['Admin','QA','Reviewer','Approver','Issuer'].includes(user.role)
    return true
  })
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Documents</h2>
        <Link className="btn" href="/documents/new">New Document</Link>
      </div>
      <div className="card">
        <div className="card-body overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Number</th>
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Lifecycle</th>
                <th className="py-2 pr-4">Security</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{d.title}</td>
                  <td className="py-2 pr-4">{d.documentNumber}</td>
                  <td className="py-2 pr-4">{d.documentVersion}</td>
                  <td className="py-2 pr-4">{d.lifecycle}</td>
                  <td className="py-2 pr-4">{d.documentSecurity}</td>
                  <td className="py-2 pr-4">
                    <Link className="btn-secondary" href={`/documents/${d.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
