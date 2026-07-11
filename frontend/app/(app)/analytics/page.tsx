'use client'

import { useEffect, useState } from 'react'
import { analyticsApi, type AnalyticsData } from '@/lib/api/analytics'
import { getErrorMessage } from '@/lib/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  DONE: '#10b981',
  CANCELLED: '#ef4444',
}

const MEMORY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    analyticsApi.get()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">{error}</div>
  }

  if (!data) return null

  const statusData = Object.entries(data.actionItems.byStatus).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
    fill: STATUS_COLORS[name] || '#6b7280',
  }))

  const memoryData = Object.entries(data.memoryTypes).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }))

  const totalMemories = Object.values(data.memoryTypes).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Organization-wide metrics and trends</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.meetings.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Memories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMemories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Decisions Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.decisions.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Knowledge Graph</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.graph.nodes}</div>
            <p className="text-xs text-muted-foreground">{data.graph.edges} relationships</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meetings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {data.meetingsByMonth.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No meeting data yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.meetingsByMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Items by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No action items yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Memory Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {memoryData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No memories extracted yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memoryData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {memoryData.map((_, i) => (
                        <Cell key={i} fill={MEMORY_COLORS[i % MEMORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Actions</span>
                <span className="text-lg font-bold">{data.actionItems.byStatus.PENDING || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-lg font-bold">{data.actionItems.byStatus.IN_PROGRESS || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed Actions</span>
                <span className="text-lg font-bold">{data.actionItems.byStatus.DONE || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cancelled</span>
                <span className="text-lg font-bold">{data.actionItems.byStatus.CANCELLED || 0}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Action Items</span>
                  <span className="text-lg font-bold">{data.actionItems.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.timeline.recent.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No timeline events yet</p>
              ) : (
                data.timeline.recent.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary/50" />
                    <span className="truncate flex-1">{t.content}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{t.memoryType.replace('_', ' ')}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.decisions.recent.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No decisions yet</p>
              ) : (
                data.decisions.recent.slice(0, 5).map((d) => (
                  <div key={d.id} className="text-sm">
                    <p className="font-medium truncate">{d.decisionText}</p>
                    <p className="text-xs text-muted-foreground">By {d.decisionMaker}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
