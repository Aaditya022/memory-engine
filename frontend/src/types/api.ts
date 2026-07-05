export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  timestamp: string
}

export interface Page<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: string
  role: Role
  organizationId: string
}

export interface RegisterRequest {
  organizationName: string
  fullName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}

export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

export type MemoryType = 'DECISION' | 'ACTION_ITEM' | 'FACT' | 'COMMITMENT' | 'DISCUSSION'

export type ActionItemStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export type ActionItemPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type MeetingSource = 'zoom' | 'meet' | 'manual'

export interface MeetingResponse {
  id: string
  title: string
  source: MeetingSource
  startedAt: string
  durationSeconds: number | null
  participants: string[]
  createdAt: string
}

export interface CreateMeetingRequest {
  title: string
  source?: MeetingSource
  startedAt?: string
  durationSeconds?: number
  participantNames?: string[]
}

export interface TranscriptResponse {
  id: string
  meetingId: string
  processed: boolean
  processedAt: string | null
  createdAt: string
}

export interface IngestTranscriptRequest {
  meetingId: string
  rawText: string
}

export interface MemoryResponse {
  id: string
  meetingId: string
  memoryType: MemoryType
  content: string
  ownerName: string
  eventDate: string | null
  confidence: number
  importanceScore: number
  createdAt: string
}

export interface SearchResultItem {
  memoryId: string
  meetingId: string
  meetingTitle: string
  memoryType: MemoryType
  content: string
  ownerName: string
  bm25Score: number
  vectorScore: number
  finalScore: number
  createdAt: string
}

export interface SearchRequest {
  query: string
  topK?: number
  memoryType?: MemoryType
  ownerName?: string
}

export interface DecisionResponse {
  id: string
  meetingId: string
  decisionText: string
  decisionMaker: string
  alternativesDiscussed: string
  finalOutcome: string
  decidedAt: string
  createdAt: string
}

export interface ActionItemResponse {
  id: string
  meetingId: string
  ownerName: string
  task: string
  deadline: string
  status: ActionItemStatus
  priority: ActionItemPriority
  createdAt: string
}

export interface UpdateActionItemStatusRequest {
  status: ActionItemStatus
}

export interface TimelineEvent {
  memoryId: string
  meetingId: string
  meetingTitle: string
  memoryType: MemoryType
  content: string
  ownerName: string
  eventDate: string
  createdAt: string
}

export interface AuditLogResponse {
  id: string
  actorUserId: string
  action: string
  resourceType: string
  resourceId: string
  details: string
  createdAt: string
}

export interface HealthResponse {
  status: string
  service: string
  timestamp: string
}
