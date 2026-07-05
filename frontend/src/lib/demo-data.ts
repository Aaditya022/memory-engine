import { subDays, subHours, subMinutes } from 'date-fns'
import type { MeetingSource, ActionItemStatus } from '@/types/api'

const BASE_DATE = new Date('2026-07-05T00:00:00Z')

export const DEMO = {
  meetings: 143,
  memories: 12847,
  projects: 26,
  people: 74,
  actionItems: 218,
  decisions: 91,
  searches: 3421,
  knowledgeConnections: 18902,
}

export const demoSparklines = {
  meetings: [12, 18, 9, 22, 15, 20, 25, 14, 19, 23, 17, 21, 16, 24],
  memories: [45, 62, 38, 71, 55, 68, 82, 49, 59, 73, 51, 64, 78, 60],
  decisions: [3, 5, 2, 7, 4, 6, 8, 3, 5, 7, 4, 6, 5, 9],
  actions: [12, 8, 15, 10, 18, 7, 14, 11, 16, 9, 13, 6, 17, 10],
}

export const demoMonthlyMeetings = [
  { month: 'Sep', count: 18 },
  { month: 'Oct', count: 24 },
  { month: 'Nov', count: 15 },
  { month: 'Dec', count: 22 },
  { month: 'Jan', count: 28 },
  { month: 'Feb', count: 20 },
  { month: 'Mar', count: 16 },
]

export const demoMonthlyMemories = [
  { month: 'Sep', count: 340 },
  { month: 'Oct', count: 520 },
  { month: 'Nov', count: 410 },
  { month: 'Dec', count: 680 },
  { month: 'Jan', count: 890 },
  { month: 'Feb', count: 720 },
  { month: 'Mar', count: 640 },
]

export const demoDecisionsTrend = [
  { month: 'Sep', count: 8 },
  { month: 'Oct', count: 12 },
  { month: 'Nov', count: 10 },
  { month: 'Dec', count: 15 },
  { month: 'Jan', count: 18 },
  { month: 'Feb', count: 14 },
  { month: 'Mar', count: 11 },
]

export const demoCompletionRate = [
  { month: 'Sep', rate: 65 },
  { month: 'Oct', rate: 72 },
  { month: 'Nov', rate: 68 },
  { month: 'Dec', rate: 78 },
  { month: 'Jan', rate: 85 },
  { month: 'Feb', rate: 82 },
  { month: 'Mar', rate: 76 },
]

export const demoSearchActivity = [
  { month: 'Sep', count: 120 },
  { month: 'Oct', count: 200 },
  { month: 'Nov', count: 180 },
  { month: 'Dec', count: 310 },
  { month: 'Jan', count: 450 },
  { month: 'Feb', count: 380 },
  { month: 'Mar', count: 290 },
]

export const demoMemoryByType = [
  { type: 'Decisions', count: 2847 },
  { type: 'Action Items', count: 3652 },
  { type: 'Facts', count: 4210 },
  { type: 'Commitments', count: 1238 },
  { type: 'Discussions', count: 900 },
]

export const demoTopContributors = [
  { name: 'Sarah Chen', meetings: 28, memories: 340 },
  { name: 'Marcus Johnson', meetings: 22, memories: 290 },
  { name: 'Elena Rodriguez', meetings: 19, memories: 260 },
  { name: 'Alex Kim', meetings: 17, memories: 210 },
  { name: 'Priya Patel', meetings: 14, memories: 180 },
]

export const demoDurationData = [
  { range: '0-15m', count: 12 },
  { range: '15-30m', count: 28 },
  { range: '30-45m', count: 45 },
  { range: '45-60m', count: 32 },
  { range: '60-90m', count: 18 },
  { range: '90m+', count: 8 },
]

export const demoRecentMeetings = Array.from({ length: 8 }, (_, i) => ({
  id: `demo-meeting-${i + 1}`,
  title: [
    'Sprint Planning — Week 12',
    'Product Review — Q1 OKRs',
    'Architecture Decision: API Migration',
    'Design Sprint — Memory Engine v2',
    'Client Onboarding — Acme Corp',
    'Engineering All-Hands',
    'Security Audit Review',
    'Team Retrospective',
  ][i],
  source: i % 3 === 0 ? 'zoom' as MeetingSource : i % 3 === 1 ? 'meet' as MeetingSource : 'manual' as MeetingSource,
  startedAt: subDays(BASE_DATE, i * 3).toISOString(),
  durationSeconds: [2700, 3600, 4500, 5400, 1800, 3600, 4800, 2400][i],
  participants: [
    ['Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez'],
    ['Alex Kim', 'Priya Patel', 'David Park'],
    ['Sarah Chen', 'Marcus Johnson', 'Priya Patel'],
    ['Elena Rodriguez', 'Alex Kim', 'David Park'],
    ['Sarah Chen', 'Priya Patel'],
    ['All (24 participants)'],
    ['Alex Kim', 'Priya Patel', 'David Park'],
    ['Sarah Chen', 'Elena Rodriguez', 'Marcus Johnson'],
  ][i],
  createdAt: subDays(BASE_DATE, i * 2 + 1).toISOString(),
  memoriesExtracted: [34, 28, 52, 41, 18, 94, 37, 22],
  decisions: [4, 3, 7, 5, 2, 11, 6, 3],
  actionItems: [12, 8, 15, 10, 5, 22, 14, 9],
}))

export const demoMemoryType = [
  'DECISION',
  'ACTION_ITEM',
  'FACT',
  'COMMITMENT',
  'DISCUSSION',
] as const

export const demoActivityFeed = Array.from({ length: 12 }, (_, i) => ({
  id: `demo-activity-${i + 1}`,
  memoryId: `demo-mem-${i + 1}`,
  meetingId: `demo-meeting-${(i % 8) + 1}`,
  meetingTitle: [
    'Sprint Planning — Week 12',
    'Product Review — Q1 OKRs',
    'Architecture Decision: API Migration',
    'Design Sprint — Memory Engine v2',
    'Client Onboarding — Acme Corp',
    'Engineering All-Hands',
    'Security Audit Review',
    'Team Retrospective',
    'Sprint Planning — Week 12',
    'Product Review — Q1 OKRs',
    'Architecture Decision: API Migration',
    'Design Sprint — Memory Engine v2',
  ][i],
  memoryType: demoMemoryType[i % 5],
  content: [
    'Decided to adopt micro-frontend architecture for the dashboard module to enable independent team deployments.',
    'Sarah Chen to finalize API contract for memory search endpoint by Friday EOD.',
    'Engineering team identified that vector search latency increased by 40% after the latest embedding model update.',
    'Committed to delivering the knowledge graph visualization feature by end of Q2.',
    'Discussed potential migration from PostgreSQL to CockroachDB for multi-region support.',
    'Deferred the decision on Redis vs. KeyDB to next sprint after benchmarks are completed.',
    'Security team flagged that JWT token rotation needs to be hardened following the latest audit.',
    'Alex Kim assigned to investigate alternative text embedding models for improved recall.',
    'Product team aligned on prioritizing semantic search over advanced filtering for the next release.',
    'Elena Rodriguez proposed adopting a event-driven architecture for real-time memory extraction.',
    'Decision to standardize on Tailwind CSS v4 across all frontend applications moving forward.',
    'Marcus Johnson taking ownership of the AI assistant chat integration with streaming responses.',
  ][i],
  ownerName: [
    'Elena Rodriguez', 'Sarah Chen', 'Marcus Johnson',
    'Alex Kim', 'Priya Patel', 'David Park', 'Sarah Chen',
    'Alex Kim', 'Elena Rodriguez', 'Marcus Johnson', 'Priya Patel', 'Sarah Chen',
  ][i],
  createdAt: subMinutes(subHours(BASE_DATE, i * 2), i * 15).toISOString(),
  eventDate: subDays(BASE_DATE, Math.floor(i / 2)).toISOString(),
}))

export const demoSearchResults = [
  {
    memoryId: 'demo-result-1',
    meetingId: 'demo-meeting-3',
    meetingTitle: 'Architecture Decision: API Migration',
    memoryType: 'DECISION',
    content: 'Decided to adopt micro-frontend architecture for the dashboard module to enable independent team deployments.',
    ownerName: 'Elena Rodriguez',
    bm25Score: 0.89,
    vectorScore: 0.94,
    finalScore: 0.92,
    createdAt: subDays(BASE_DATE, 3).toISOString(),
  },
  {
    memoryId: 'demo-result-2',
    meetingId: 'demo-meeting-1',
    meetingTitle: 'Sprint Planning — Week 12',
    memoryType: 'ACTION_ITEM',
    content: 'Sarah Chen to finalize API contract for memory search endpoint by Friday EOD.',
    ownerName: 'Sarah Chen',
    bm25Score: 0.85,
    vectorScore: 0.91,
    finalScore: 0.88,
    createdAt: subDays(BASE_DATE, 5).toISOString(),
  },
  {
    memoryId: 'demo-result-3',
    meetingId: 'demo-meeting-5',
    meetingTitle: 'Client Onboarding — Acme Corp',
    memoryType: 'FACT',
    content: 'Engineering team identified that vector search latency increased by 40% after the latest embedding model update.',
    ownerName: 'Marcus Johnson',
    bm25Score: 0.82,
    vectorScore: 0.88,
    finalScore: 0.85,
    createdAt: subDays(BASE_DATE, 2).toISOString(),
  },
  {
    memoryId: 'demo-result-4',
    meetingId: 'demo-meeting-2',
    meetingTitle: 'Product Review — Q1 OKRs',
    memoryType: 'COMMITMENT',
    content: 'Product team aligned on prioritizing semantic search over advanced filtering for the next release.',
    ownerName: 'Priya Patel',
    bm25Score: 0.78,
    vectorScore: 0.84,
    finalScore: 0.81,
    createdAt: subDays(BASE_DATE, 4).toISOString(),
  },
  {
    memoryId: 'demo-result-5',
    meetingId: 'demo-meeting-7',
    meetingTitle: 'Security Audit Review',
    memoryType: 'DISCUSSION',
    content: 'Security team flagged that JWT token rotation needs to be hardened following the latest audit.',
    ownerName: 'Sarah Chen',
    bm25Score: 0.75,
    vectorScore: 0.80,
    finalScore: 0.78,
    createdAt: subDays(BASE_DATE, 1).toISOString(),
  },
]

export const demoTimelineEvents = demoActivityFeed.map((a) => ({
  memoryId: a.memoryId,
  meetingId: a.meetingId,
  meetingTitle: a.meetingTitle,
  memoryType: a.memoryType as typeof demoMemoryType[number],
  content: a.content,
  ownerName: a.ownerName,
  eventDate: a.eventDate,
  createdAt: a.createdAt,
}))

export const demoActionItems = [
  { id: 'demo-ai-1', meetingId: 'demo-meeting-1', ownerName: 'Sarah Chen', task: 'Finalize API contract for memory search endpoint', deadline: subDays(BASE_DATE, -3).toISOString(), status: 'IN_PROGRESS' as ActionItemStatus, priority: 'HIGH', createdAt: subDays(BASE_DATE, 5).toISOString() },
  { id: 'demo-ai-2', meetingId: 'demo-meeting-2', ownerName: 'Alex Kim', task: 'Investigate alternative text embedding models', deadline: subDays(BASE_DATE, -7).toISOString(), status: 'PENDING' as ActionItemStatus, priority: 'MEDIUM', createdAt: subDays(BASE_DATE, 4).toISOString() },
  { id: 'demo-ai-3', meetingId: 'demo-meeting-3', ownerName: 'Elena Rodriguez', task: 'Create migration plan for micro-frontend architecture', deadline: subDays(BASE_DATE, -14).toISOString(), status: 'DONE' as ActionItemStatus, priority: 'HIGH', createdAt: subDays(BASE_DATE, 3).toISOString() },
  { id: 'demo-ai-4', meetingId: 'demo-meeting-4', ownerName: 'Marcus Johnson', task: 'Benchmark PostgreSQL vs CockroachDB for multi-region', deadline: subDays(BASE_DATE, -10).toISOString(), status: 'PENDING' as ActionItemStatus, priority: 'LOW', createdAt: subDays(BASE_DATE, 2).toISOString() },
  { id: 'demo-ai-5', meetingId: 'demo-meeting-6', ownerName: 'Priya Patel', task: 'Design new semantic search result page', deadline: subDays(BASE_DATE, -5).toISOString(), status: 'IN_PROGRESS' as ActionItemStatus, priority: 'MEDIUM', createdAt: subDays(BASE_DATE, 1).toISOString() },
  { id: 'demo-ai-6', meetingId: 'demo-meeting-1', ownerName: 'David Park', task: 'Implement rate limiting for search API', deadline: subDays(BASE_DATE, -8).toISOString(), status: 'DONE' as ActionItemStatus, priority: 'HIGH', createdAt: subDays(BASE_DATE, 6).toISOString() },
]

export const demoDecisions = [
  { id: 'demo-dec-1', meetingId: 'demo-meeting-3', decisionText: 'Adopt micro-frontend architecture for dashboard module', decisionMaker: 'Elena Rodriguez', alternativesDiscussed: 'Monorepo with module federation, iframe-based isolation', finalOutcome: 'Approved for Q2 implementation', decidedAt: subDays(BASE_DATE, 3).toISOString(), createdAt: subDays(BASE_DATE, 3).toISOString() },
  { id: 'demo-dec-2', meetingId: 'demo-meeting-2', decisionText: 'Prioritize semantic search over advanced filtering', decisionMaker: 'Priya Patel', alternativesDiscussed: 'Build both in parallel, delay search to Q3', finalOutcome: 'Semantic search to ship first', decidedAt: subDays(BASE_DATE, 5).toISOString(), createdAt: subDays(BASE_DATE, 5).toISOString() },
  { id: 'demo-dec-3', meetingId: 'demo-meeting-6', decisionText: 'Standardize on Tailwind CSS v4 across all frontend apps', decisionMaker: 'Marcus Johnson', alternativesDiscussed: 'Stay with v3, migrate to Panda CSS', finalOutcome: 'Migration to begin next sprint', decidedAt: subDays(BASE_DATE, 7).toISOString(), createdAt: subDays(BASE_DATE, 7).toISOString() },
  { id: 'demo-dec-4', meetingId: 'demo-meeting-7', decisionText: 'Harden JWT token rotation mechanism', decisionMaker: 'Sarah Chen', alternativesDiscussed: 'Replace with OAuth 2.0, maintain current approach', finalOutcome: 'Implement refresh token rotation', decidedAt: subDays(BASE_DATE, 2).toISOString(), createdAt: subDays(BASE_DATE, 2).toISOString() },
  { id: 'demo-dec-5', meetingId: 'demo-meeting-4', decisionText: 'Deliver knowledge graph visualization by end of Q2', decisionMaker: 'Alex Kim', alternativesDiscussed: 'Use third-party library, build in-house', finalOutcome: 'Build custom D3-based visualization', decidedAt: subDays(BASE_DATE, 4).toISOString(), createdAt: subDays(BASE_DATE, 4).toISOString() },
]

export const demoMeetingGrowth = demoMonthlyMeetings
export const demoMemoryGrowth = demoMonthlyMemories

export const demoChatResponse = `Great question! Here's what I found across your organization:

**Recent Decisions**
1. **Micro-frontend Architecture** — Adopted for dashboard module (Elena Rodriguez)
2. **Semantic Search Priority** — Prioritized over advanced filtering (Priya Patel)  
3. **Tailwind CSS v4** — Standardized across all frontend apps (Marcus Johnson)

**Pending Action Items**
- Sarah Chen: Finalize API contract for memory search endpoint *(Due: Fri)*
- Alex Kim: Investigate alternative text embedding models *(Due: Next Wed)*
- Priya Patel: Design new semantic search result page *(In Progress)*

**Meeting Summary**
In the last 7 days, your team has held 12 meetings, generating 94 new memories with a decision adoption rate of 78%.

Would you like me to dive deeper into any specific area?` as const
