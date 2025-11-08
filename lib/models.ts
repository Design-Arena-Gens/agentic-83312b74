export type Role = 'Admin' | 'Author' | 'Reviewer' | 'Approver' | 'Issuer' | 'QA' | 'Viewer'

export type SecurityClass = 'confidential' | 'internal' | 'restricted' | 'public'

export interface User {
  id: string
  name: string
  role: Role
}

export interface ElectronicSignature {
  id: string
  documentId: string
  userId: string
  userName: string
  role: Role
  meaning: 'review' | 'approval' | 'issuance' | 'change' | 'retire'
  reason?: string
  signedAt: string
  hash: string
}

export interface AuditEvent {
  id: string
  timestamp: string
  actorId?: string
  actorName?: string
  actorRole?: Role
  action: string
  entity: 'document' | 'documentType' | 'workflow' | 'auth' | 'signature'
  entityId?: string
  details?: Record<string, unknown>
  ip?: string
}

export interface DocumentType {
  id: string
  type: string
  description: string
}

export type DocumentLifecycle = 'Draft' | 'In Review' | 'Approved' | 'Effective' | 'Obsolete'

export interface DocumentVersion {
  version: string
  title: string
  content?: string
  createdAt: string
  createdBy: string
}

export interface DocumentRecord {
  id: string
  title: string
  documentNumber: string
  documentVersion: string
  dateCreated: string
  createdBy: string
  dateOfIssue?: string
  issuedBy?: string
  issuerRole?: Role
  effectiveFromDate?: string
  dateOfNextIssue?: string
  documentType: 'Manual' | 'procedure' | 'process' | 'work instruction' | 'policy' | 'checklist' | 'format' | 'template' | 'masters'
  documentCategory: string
  documentSecurity: SecurityClass
  lifecycle: DocumentLifecycle
  versions: DocumentVersion[]
}

export interface WorkflowStep {
  id: string
  name: string
  role: Role
  meaning: ElectronicSignature['meaning']
}

export interface WorkflowConfig {
  id: string
  name: string
  category: string
  steps: WorkflowStep[]
}

export interface DatabaseSchema {
  users: User[]
  documentTypes: DocumentType[]
  documents: DocumentRecord[]
  workflows: WorkflowConfig[]
  audit: AuditEvent[]
  signatures: ElectronicSignature[]
}
