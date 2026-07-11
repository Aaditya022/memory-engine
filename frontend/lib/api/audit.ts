import { api } from './client'
import type { ApiResponse, AuditLogResponse, Page } from '@/types/api'

export const auditApi = {
  list: (page = 0, size = 20) =>
    api.get<ApiResponse<Page<AuditLogResponse>>>('/audit', {
      params: { page, size, sort: 'createdAt,desc' },
    }).then((r) => r.data),
}
