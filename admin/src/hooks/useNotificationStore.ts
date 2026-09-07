import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotifItem } from '@/components/NotifProvider'

interface NotifState {
  items: NotifItem[]
  unread: number
  add: (item: NotifItem) => void
  markRead: (id: string) => void
  remove: (id: string) => void
  markAllRead: () => void
  clear: () => void
}

export const useNotificationStore = create<NotifState>()(
  persist(
    (set) => ({
      items: [],
      unread: 0,
      add: (item) => {
        set((s) => ({ items: [{ ...item, read: false }, ...s.items].slice(0, 50), unread: s.unread + 1 }))
      },
      markRead: (id) =>
        set((s) => {
          const isUnread = s.items.some((i) => i.id === id && !i.read)
          return {
            items: s.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
            unread: isUnread ? Math.max(0, s.unread - 1) : s.unread,
          }
        }),
      remove: (id) =>
        set((s) => {
          const item = s.items.find((i) => i.id === id)
          return {
            items: s.items.filter((i) => i.id !== id),
            unread: item && !item.read ? Math.max(0, s.unread - 1) : s.unread,
          }
        }),
      markAllRead: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })), unread: 0 })),
      clear: () => set({ items: [], unread: 0 }),
    }),
    { name: 'app-notifications' },
  ),
)
