import { createContext, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useNotificationStore } from '@/hooks/useNotificationStore'

export type NotifItem = {
  id: string
  title: string
  message: string
  createdAt: string
  requestId?: string
  read?: boolean
}

export const broadcastChannel = new BroadcastChannel('app-notifications')

interface NotifCtxType {
  show: (title: string, message: string, requestId?: string) => void
  requestPermission: () => Promise<void>
}

const NotifContext = createContext<NotifCtxType>({ show: () => {}, requestPermission: async () => {} })

export function NotifProvider({ children }: { children: ReactNode }) {
  const addNotif = useNotificationStore((s) => s.add)

  const show = useCallback(
    (title: string, message: string, requestId?: string) => {
      const item: NotifItem = {
        id: crypto.randomUUID(),
        title,
        message,
        createdAt: new Date().toISOString(),
        requestId,
      }
      addNotif(item)
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message })
      }
    },
    [addNotif],
  )

  const requestPermission = useCallback(async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'notif' && e.data?.item) {
        addNotif(e.data.item)
      }
    }
    broadcastChannel.addEventListener('message', handler)
    return () => broadcastChannel.removeEventListener('message', handler)
  }, [addNotif])

  const value = useMemo(() => ({ show, requestPermission }), [show, requestPermission])

  return <NotifContext.Provider value={value}>{children}</NotifContext.Provider>
}

export { NotifContext }
