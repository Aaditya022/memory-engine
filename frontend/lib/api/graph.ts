import { api } from './client'
import type { ApiResponse, GraphResponse } from '@/types/api'

export const graphApi = {
  getFull: () =>
    api.get<ApiResponse<GraphResponse>>('/graph').then((r) => r.data),

  getByEntity: (entity: string, depth = 2) =>
    api.get<ApiResponse<GraphResponse>>('/graph', {
      params: { entity, depth },
    }).then((r) => r.data),

  getByMeeting: (meetingId: string) =>
    api.get<ApiResponse<GraphResponse>>(`/graph/meeting/${meetingId}`).then((r) => r.data),
}
