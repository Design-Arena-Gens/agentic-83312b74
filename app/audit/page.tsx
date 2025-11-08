import { listAudit } from '@/lib/audit'

export default function AuditPage() {
  const audit = listAudit(500)
  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Audit Trail</h2>
      <div className="card">
        <div className="card-body overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Entity</th>
              </tr>
            </thead>
            <tbody>
              {audit.map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{new Date(a.timestamp).toLocaleString()}</td>
                  <td className="py-2 pr-4">{a.actorName || '?'}</td>
                  <td className="py-2 pr-4">{a.actorRole || '?'}</td>
                  <td className="py-2 pr-4">{a.action}</td>
                  <td className="py-2 pr-4">{a.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
