import { api } from './client'
import type { ApiResponse, IntegrationResponse, UpdateIntegrationRequest } from '@/types/api'

export const integrationsApi = {
  list: () =>
    api.get<ApiResponse<IntegrationResponse[]>>('/integrations').then((r) => r.data),

  update: (name: string, data: UpdateIntegrationRequest) =>
    api.put<ApiResponse<IntegrationResponse>>(`/integrations/${name}`, data).then((r) => r.data),

  disconnect: (name: string) =>
    api.delete<ApiResponse<null>>(`/integrations/${name}`).then((r) => r.data),
}
