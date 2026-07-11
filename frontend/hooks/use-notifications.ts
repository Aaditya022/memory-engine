'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface NotificationEvent {
  type: string
  title: string
  description: string
  resourceId: string | null
  resourceType: string | null
  timestamp: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const url = `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)

    es.addEventListener('connected', () => {
      setConnected(true)
    })

    es.addEventListener('notification', (event) => {
      try {
        const data = JSON.parse(event.data) as NotificationEvent
        setNotifications((prev) => [data, ...prev].slice(0, 50))
        setUnreadCount((prev) => prev + 1)
      } catch {}
    })

    es.onerror = () => {
      setConnected(false)
    }

    eventSourceRef.current = es

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [])

  const markAllRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const clear = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    connected,
    unreadCount,
    markAllRead,
    clear,
  }
}
