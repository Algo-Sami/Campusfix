'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { timeAgo, formatDateTime } from '@/lib/utils'
import type { Notification } from '@/types/database'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const supabase = createClient()

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setNotifications((data as Notification[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  async function markAllAsRead() {
    setMarkingAll(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={22} className="text-teal-700" />
            Notifications
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Updates on your reported issues and campus maintenance progress.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            loading={markingAll}
          >
            <CheckCheck size={16} /> Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border p-4 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Bell size={36} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
          <p className="text-sm text-gray-500">
            You are all caught up! You will be notified here when an administrator updates your issues.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                notif.is_read ? 'bg-white' : 'bg-teal-50/40'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                  notif.is_read ? 'bg-transparent' : 'bg-teal-600'
                }`} />
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{notif.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 pt-1">
                    <Clock size={12} /> {timeAgo(notif.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.issue_id && (
                  <Link
                    href={`/issues/${notif.issue_id}`}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors"
                    title="View related issue"
                  >
                    <ExternalLink size={16} />
                  </Link>
                )}
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-xs text-gray-400 hover:text-gray-700 p-1"
                    title="Mark as read"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
