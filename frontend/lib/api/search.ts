import { api } from './client'
import type {
  ApiResponse,
  SearchRequest,
  SearchResultItem,
  MemoryType,
} from '@/types/api'

export const searchApi = {
  search: (data: SearchRequest) =>
    api.post<ApiResponse<SearchResultItem[]>>('/search', data).then((r) => r.data),

  searchGet: (params: { query: string; topK?: number; memoryType?: MemoryType; ownerName?: string }) =>
    api.get<ApiResponse<SearchResultItem[]>>('/memory/search', { params }).then((r) => r.data),
}
