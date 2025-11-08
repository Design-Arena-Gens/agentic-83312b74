import Link from 'next/link'
import { cookies } from 'next/headers'
import { getUserFromCookies } from '@/lib/auth'

export default async function HomePage() {
  const user = await getUserFromCookies(cookies())
  return (
    <div className="grid gap-6">
      {!user ? (
        <div className="card">
          <div className="card-header">Welcome</div>
          <div className="card-body">
            <p className="mb-4">Please log in to access the DMS.</p>
            <Link href="/auth/login" className="btn">Go to Login</Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">Documents</div>
            <div className="card-body flex gap-3">
              <Link className="btn" href="/documents">Browse Documents</Link>
              <Link className="btn-secondary" href="/documents/new">Create Document</Link>
            </div>
          </div>
          <div className="card">
            <div className="card-header">Administration</div>
            <div className="card-body flex gap-3">
              <Link className="btn-secondary" href="/admin/workflows">Workflows</Link>
              <Link className="btn-secondary" href="/admin/types">Document Types</Link>
              <Link className="btn-secondary" href="/audit">Audit Trail</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
