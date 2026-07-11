import { api } from './client'
import type { ApiResponse, ChatRequest, ChatResponse } from '@/types/api'

export const chatApi = {
  send: (data: ChatRequest) =>
    api.post<ApiResponse<ChatResponse>>('/chat', data).then((r) => r.data),
}
