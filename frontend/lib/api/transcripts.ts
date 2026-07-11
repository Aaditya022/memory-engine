import { api } from './client'
import type {
  ApiResponse,
  TranscriptResponse,
  IngestTranscriptRequest,
} from '@/types/api'

export const transcriptsApi = {
  ingest: (data: IngestTranscriptRequest) =>
    api.post<ApiResponse<TranscriptResponse>>('/transcripts', data).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<TranscriptResponse>>(`/transcripts/${id}`).then((r) => r.data),

  listByMeeting: (meetingId: string) =>
    api.get<ApiResponse<TranscriptResponse[]>>('/transcripts', { params: { meetingId } }).then((r) => r.data),
}
