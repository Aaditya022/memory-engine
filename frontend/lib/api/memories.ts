import { api } from './client'
import type { ApiResponse, MemoryResponse, SearchResultItem } from '@/types/api'

export const memoriesApi = {
  byPerson: (name: string) =>
    api.get<ApiResponse<MemoryResponse[]>>(`/memory/person/${encodeURIComponent(name)}`).then((r) => r.data),

  byProject: (name: string) =>
    api.get<ApiResponse<SearchResultItem[]>>(`/memory/project/${encodeURIComponent(name)}`).then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/memory/${id}`).then((r) => r.data),
}
