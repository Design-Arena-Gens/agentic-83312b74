import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { signToken, getUserFromCookies } from '@/lib/auth'
import { recordAudit } from '@/lib/audit'

const roles = ['Admin','Author','Reviewer','Approver','Issuer','QA','Viewer'] as const

type Role = typeof roles[number]

async function login(formData: FormData) {
  'use server'
  const schema = z.object({ name: z.string().min(2), role: z.enum(roles) })
  const parsed = schema.parse({ name: formData.get('name'), role: formData.get('role') })
  const user = { id: uuidv4(), name: parsed.name, role: parsed.role }
  const token = signToken(user)
  cookies().set('dm_auth', token, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 12 })
  recordAudit({ action: 'login', entity: 'auth', actorId: user.id, actorName: user.name, actorRole: user.role })
  redirect('/')
}

export default async function LoginPage() {
  const user = await getUserFromCookies(cookies())
  if (user) redirect('/')
  return (
    <form action={login} className="max-w-md mx-auto card">
      <div className="card-header">Login</div>
      <div className="card-body grid gap-4">
        <label className="block">
          <span className="label">Name</span>
          <input className="input" name="name" placeholder="Full name" required />
        </label>
        <label className="block">
          <span className="label">Role</span>
          <select className="input" name="role" required>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <button className="btn" type="submit">Sign In</button>
      </div>
    </form>
  )
}
