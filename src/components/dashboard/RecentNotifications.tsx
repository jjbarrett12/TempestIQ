'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  channel: string
  status: string
  message: string
  createdAt: string
  event: {
    eventType: string
    severity: string
  }
}

export function RecentNotifications({ customerId }: { customerId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/notifications?customerId=${customerId}&limit=10`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch notifications:', err)
        setLoading(false)
      })
  }, [customerId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'text-green-600'
      case 'SENT':
        return 'text-blue-600'
      case 'FAILED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Recent Notifications</h2>
      </div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            No notifications yet
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="p-4">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {notification.channel}
                </span>
                <span className={`text-xs ${getStatusColor(notification.status)}`}>
                  {notification.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
