import { api } from './client'
import type { ApiResponse, TimelineEvent } from '@/types/api'

export const timelineApi = {
  list: (topic?: string) =>
    api.get<ApiResponse<TimelineEvent[]>>('/memory/timeline', {
      params: topic ? { topic } : undefined,
    }).then((r) => r.data),
}
