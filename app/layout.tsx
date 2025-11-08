import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'DocumentManagement',
  description: 'Pharmaceutical DMS with compliance features',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">DocumentManagement</h1>
            <a className="btn-secondary" href="/auth/logout">Logout</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
