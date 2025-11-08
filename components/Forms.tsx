import { ReactNode } from 'react'
import clsx from 'clsx'

export function Field({ label, children, className }: { label: string, children: ReactNode, className?: string }) {
  return (
    <label className={clsx('block', className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body grid gap-4">{children}</div>
    </div>
  )
}
