import { api } from './client'
import type { HealthResponse } from '@/types/api'

export const healthApi = {
  check: () => api.get<HealthResponse>('/health').then((r) => r.data),
}
