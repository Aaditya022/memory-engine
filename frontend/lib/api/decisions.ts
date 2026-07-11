import { api } from './client'
import type { ApiResponse, DecisionResponse } from '@/types/api'

export const decisionsApi = {
  list: () =>
    api.get<ApiResponse<DecisionResponse[]>>('/memory/decisions').then((r) => r.data),
}
