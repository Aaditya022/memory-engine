export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  timestamp: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: string
  role: Role
  organizationId: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  organizationName: string
  fullName: string
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

export interface MeetingResponse {
  id: string
  title: string
  source: string | null
  startedAt: string | null
  durationSeconds: number | null
  participants: string[]
  createdAt: string
}

export interface CreateMeetingRequest {
  title: string
  source?: string
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
  confidence: number | null
  importanceScore: number | null
  createdAt: string
}

export interface SearchRequest {
  query: string
  topK?: number
  memoryType?: MemoryType
  ownerName?: string
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
  deadline: string | null
  status: ActionItemStatus
  priority: ActionItemPriority
  createdAt: string
}

export interface TimelineEvent {
  memoryId: string
  meetingId: string
  meetingTitle: string
  memoryType: MemoryType
  content: string
  ownerName: string
  eventDate: string | null
  createdAt: string
}

export interface AuditLogResponse {
  id: string
  actorUserId: string | null
  action: string
  resourceType: string
  resourceId: string
  details: string
  createdAt: string
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface IntegrationResponse {
  id: string
  name: string
  enabled: boolean
  status: string
  configJson: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateIntegrationRequest {
  enabled: boolean
  configJson?: string
}

export interface HealthResponse {
  status: string
  service: string
  timestamp: string
}

export interface GraphNode {
  id: string
  label: string
  type: string
  mentionCount: number
  meetingId: string | null
  meetingTitle: string | null
  meetingSource: string | null
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  relationship: string
  confidence: number
  meetingId: string | null
}

export interface GraphResponse {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  query: string
  history?: ChatMessage[]
  topK?: number
}

export interface Citation {
  memoryId: string
  meetingId: string
  meetingTitle: string
  content: string
  memoryType: string
  ownerName: string
  score: number
  createdAt: string
}

export interface ChatResponse {
  answer: string
  history: ChatMessage[]
  citations: Citation[]
  followUpQuestions: string[]
}
