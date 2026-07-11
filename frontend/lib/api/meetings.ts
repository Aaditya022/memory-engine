import { api } from './client'
import type {
  ApiResponse,
  MeetingResponse,
  CreateMeetingRequest,
  Page,
} from '@/types/api'

export const meetingsApi = {
  list: (page = 0, size = 10) =>
    api.get<ApiResponse<Page<MeetingResponse>>>('/meetings', {
      params: { page, size, sort: 'createdAt,desc' },
    }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<MeetingResponse>>(`/meetings/${id}`).then((r) => r.data),

  create: (data: CreateMeetingRequest) =>
    api.post<ApiResponse<MeetingResponse>>('/meetings', data).then((r) => r.data),
}
