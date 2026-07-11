import { meetingsApi } from './meetings'
import { decisionsApi } from './decisions'
import { actionItemsApi } from './action-items'
import { timelineApi } from './timeline'
import { graphApi } from './graph'
import { searchApi } from './search'
import type { MeetingResponse, DecisionResponse, ActionItemResponse, TimelineEvent, MemoryType } from '@/types/api'

export interface AnalyticsData {
  meetings: { total: number; recent: MeetingResponse[] }
  decisions: { total: number; recent: DecisionResponse[] }
  actionItems: { total: number; byStatus: Record<string, number>; recent: ActionItemResponse[] }
  timeline: { total: number; recent: TimelineEvent[] }
  graph: { nodes: number; edges: number }
  memoryTypes: Record<string, number>
  meetingsByMonth: { month: string; count: number }[]
}

export const analyticsApi = {
  get: async (): Promise<AnalyticsData> => {
    const emptySearch = searchApi.searchGet({ query: '', topK: 1000 }).then(r => r.data).catch(() => [])

    const [meetingsRes, decisionsRes, actionItemsRes, timelineRes, graphRes, memories] = await Promise.all([
      meetingsApi.list(0, 100),
      decisionsApi.list().catch(() => ({ data: [] as DecisionResponse[] })),
      actionItemsApi.list().catch(() => ({ data: [] as ActionItemResponse[] })),
      timelineApi.list().catch(() => ({ data: [] as TimelineEvent[] })),
      graphApi.getFull().catch(() => ({ data: { nodes: [], edges: [] } })),
      emptySearch,
    ])

    const meetings = meetingsRes.data.content
    const decisions = Array.isArray(decisionsRes) ? decisionsRes : decisionsRes.data || []
    const actionItems = Array.isArray(actionItemsRes) ? actionItemsRes : actionItemsRes.data || []
    const timeline = Array.isArray(timelineRes) ? timelineRes : timelineRes.data || []

    const byStatus: Record<string, number> = {}
    actionItems.forEach((a: ActionItemResponse) => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1
    })

    const memoryTypes: Record<string, number> = {}
    const allMemories = [...memories]
    allMemories.forEach((m) => {
      const type = (m as { memoryType?: string }).memoryType || 'UNKNOWN'
      memoryTypes[type] = (memoryTypes[type] || 0) + 1
    })

    const meetingsByMonth: Record<string, number> = {}
    meetings.forEach((m: MeetingResponse) => {
      const d = new Date(m.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      meetingsByMonth[key] = (meetingsByMonth[key] || 0) + 1
    })

    return {
      meetings: { total: meetingsRes.data.totalElements, recent: meetings.slice(0, 5) },
      decisions: { total: decisions.length, recent: decisions.slice(0, 5) },
      actionItems: { total: actionItems.length, byStatus, recent: actionItems.slice(0, 5) },
      timeline: { total: timeline.length, recent: timeline.slice(0, 5) },
      graph: { nodes: graphRes.data.nodes.length, edges: graphRes.data.edges.length },
      memoryTypes,
      meetingsByMonth: Object.entries(meetingsByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
    }
  },
}
