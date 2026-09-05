import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NotifItem } from '@/components/NotifProvider'

interface NotifState {
  items: NotifItem[]
  unread: number
  add: (item: NotifItem) => void
  markAllRead: () => void
  clear: () => void
}

export const useNotificationStore = create<NotifState>()(
  persist(
    (set) => ({
      items: [],
      unread: 0,
      add: (item) => {
        set((s) => ({ items: [item, ...s.items].slice(0, 50), unread: s.unread + 1 }))
      },
      markAllRead: () => set({ unread: 0 }),
      clear: () => set({ items: [], unread: 0 }),
    }),
    { name: 'app-notifications' },
  ),
)
