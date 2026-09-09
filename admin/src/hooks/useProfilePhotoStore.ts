import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProfilePhotoState {
  photo: string | null
  setPhoto: (photo: string | null) => void
}

export const useProfilePhotoStore = create<ProfilePhotoState>()(
  persist(
    (set) => ({
      photo: null,
      setPhoto: (photo) => set({ photo }),
    }),
    { name: 'app-profile-photo' },
  ),
)