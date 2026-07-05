import apiClient from './api-client'
import type {
  ApiResponse,
  Page,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  MeetingResponse,
  CreateMeetingRequest,
  TranscriptResponse,
  IngestTranscriptRequest,
  MemoryResponse,
  SearchResultItem,
  SearchRequest,
  DecisionResponse,
  ActionItemResponse,
  UpdateActionItemStatusRequest,
  TimelineEvent,
  AuditLogResponse,
  HealthResponse,
} from '@/types/api'

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken?: string) =>
    apiClient.post<ApiResponse<void>>('/auth/logout', refreshToken ? { refreshToken } : undefined),
}

export const meetingsApi = {
  list: (params?: { page?: number; size?: number; sort?: string }) =>
    apiClient.get<ApiResponse<Page<MeetingResponse>>>('/meetings', { params }),

  get: (id: string) =>
    apiClient.get<ApiResponse<MeetingResponse>>(`/meetings/${id}`),

  create: (data: CreateMeetingRequest) =>
    apiClient.post<ApiResponse<MeetingResponse>>('/meetings', data),
}

export const transcriptsApi = {
  ingest: (data: IngestTranscriptRequest) =>
    apiClient.post<ApiResponse<TranscriptResponse>>('/transcripts', data),

  get: (id: string) =>
    apiClient.get<ApiResponse<TranscriptResponse>>(`/transcripts/${id}`),
}

export const memoryApi = {
  search: (params: { query: string; topK?: number; memoryType?: string; ownerName?: string }) =>
    apiClient.get<ApiResponse<SearchResultItem[]>>('/memory/search', { params }),

  searchPost: (data: SearchRequest) =>
    apiClient.post<ApiResponse<SearchResultItem[]>>('/search', data),

  getByPerson: (name: string) =>
    apiClient.get<ApiResponse<MemoryResponse[]>>(`/memory/person/${encodeURIComponent(name)}`),

  getByProject: (name: string) =>
    apiClient.get<ApiResponse<SearchResultItem[]>>(`/memory/project/${encodeURIComponent(name)}`),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/memory/${id}`),
}

export const decisionsApi = {
  list: () =>
    apiClient.get<ApiResponse<DecisionResponse[]>>('/memory/decisions'),
}

export const actionItemsApi = {
  list: (params?: { status?: string; ownerName?: string }) =>
    apiClient.get<ApiResponse<ActionItemResponse[]>>('/memory/action-items', { params }),

  updateStatus: (id: string, data: UpdateActionItemStatusRequest) =>
    apiClient.patch<ApiResponse<ActionItemResponse>>(`/memory/action-items/${id}/status`, data),
}

export const timelineApi = {
  list: (params?: { topic?: string }) =>
    apiClient.get<ApiResponse<TimelineEvent[]>>('/memory/timeline', { params }),
}

export const auditApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient.get<ApiResponse<Page<AuditLogResponse>>>('/audit', { params }),
}

export const healthApi = {
  check: () =>
    apiClient.get<ApiResponse<HealthResponse>>('/health'),
}
