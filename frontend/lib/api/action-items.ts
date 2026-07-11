import { api } from './client'
import type { ApiResponse, ActionItemResponse, ActionItemStatus } from '@/types/api'

export const actionItemsApi = {
  list: (params?: { status?: ActionItemStatus; ownerName?: string }) =>
    api.get<ApiResponse<ActionItemResponse[]>>('/memory/action-items', { params }).then((r) => r.data),

  updateStatus: (id: string, status: ActionItemStatus) =>
    api.patch<ApiResponse<ActionItemResponse>>(`/memory/action-items/${id}/status`, { status }).then((r) => r.data),
}
