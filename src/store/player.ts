import { create } from 'zustand'

interface PlayerState {
  currentStreamUrl: string
  currentTitle: string
  currentSubtitle: string
  isPlaying: boolean
  isMinimized: boolean

  setStream: (url: string, title: string, subtitle?: string) => void
  stop: () => void
  toggleMinimize: () => void
  setMinimized: (minimized: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentStreamUrl: '',
  currentTitle: 'Player Ready',
  currentSubtitle: 'Select content to play',
  isPlaying: false,
  isMinimized: false,

  setStream: (url, title, subtitle = '') => {
    console.log('📦 [PlayerStore] setStream called:', {
      url,
      urlLength: url?.length,
      urlType: typeof url,
      title,
      subtitle
    })

    set({
      currentStreamUrl: url,
      currentTitle: title,
      currentSubtitle: subtitle,
      isPlaying: true,
      isMinimized: false
    })

    console.log('📦 [PlayerStore] State updated, currentStreamUrl is now:', url)
  },

  stop: () => set({
    currentStreamUrl: '',
    currentTitle: 'Stream stopped',
    currentSubtitle: 'Player ready',
    isPlaying: false
  }),

  toggleMinimize: () => set((state) => ({
    isMinimized: !state.isMinimized
  })),

  setMinimized: (minimized) => set({ isMinimized: minimized }),
}))
