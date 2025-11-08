import { cookies as headerCookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { CookieListItem } from 'next/dist/compiled/@edge-runtime/cookies'
import { NextRequest } from 'next/server'
import { Role, User } from './models'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function signToken(user: User): string {
  return jwt.sign({ sub: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '12h' })
}

export async function getUserFromCookies(cookies: ReturnType<typeof headerCookies>): Promise<User | null> {
  try {
    const token = cookies.get('dm_auth')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.sub, name: decoded.name, role: decoded.role as Role }
  } catch {
    return null
  }
}

export function getUserFromRequest(req: NextRequest): User | null {
  try {
    const token = req.cookies.get('dm_auth')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { id: decoded.sub, name: decoded.name, role: decoded.role as Role }
  } catch {
    return null
  }
}

export function requireRole(user: User | null, roles: Role[]): asserts user is User {
  if (!user || !roles.includes(user.role)) {
    const e: any = new Error('Forbidden')
    e.status = 403
    throw e
  }
}
