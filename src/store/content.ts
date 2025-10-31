import { create } from 'zustand'
import type {
  Channel,
  VODItem,
  SeriesItem,
  Episode,
  ContentTab,
  ViewMode,
  Genre,
  VODCategory,
  SeriesCategory
} from '@/types'

interface ContentState {
  // Current state
  currentTab: ContentTab
  viewMode: ViewMode
  selectedCategoryId: string | null
  searchQuery: string

  // Data
  channels: Channel[]
  genres: Map<string, string>
  vodCategories: VODCategory[]
  vodItems: VODItem[]
  seriesCategories: SeriesCategory[]
  seriesItems: SeriesItem[]
  episodes: Episode[]

  // Pagination
  currentPage: number
  hasMoreItems: boolean
  isLoading: boolean

  // Actions
  setTab: (tab: ContentTab) => void
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (id: string | null) => void

  // Data setters
  setChannels: (channels: Channel[]) => void
  setGenres: (genres: Genre[]) => void
  setVODCategories: (categories: VODCategory[]) => void
  setVODItems: (items: VODItem[], append?: boolean) => void
  setSeriesCategories: (categories: SeriesCategory[]) => void
  setSeriesItems: (items: SeriesItem[], append?: boolean) => void
  setEpisodes: (episodes: Episode[]) => void

  // Loading state
  setLoading: (loading: boolean) => void
  setHasMoreItems: (hasMore: boolean) => void
  incrementPage: () => void
  resetPage: () => void

  // Reset
  resetContent: () => void
}

export const useContentStore = create<ContentState>((set) => ({
  // Initial state
  currentTab: 'live',
  viewMode: 'grid',
  selectedCategoryId: null,
  searchQuery: '',

  channels: [],
  genres: new Map(),
  vodCategories: [],
  vodItems: [],
  seriesCategories: [],
  seriesItems: [],
  episodes: [],

  currentPage: 1,
  hasMoreItems: false,
  isLoading: false,

  // Actions
  setTab: (tab) => set({
    currentTab: tab,
    selectedCategoryId: null,
    searchQuery: '',
    currentPage: 1
  }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategory: (id) => set({
    selectedCategoryId: id,
    currentPage: 1
  }),

  // Data setters
  setChannels: (channels) => set({ channels }),

  setGenres: (genres) => {
    const genreMap = new Map<string, string>()
    genres.forEach(genre => {
      genreMap.set(genre.id, genre.title)
    })
    set({ genres: genreMap })
  },

  setVODCategories: (categories) => set({ vodCategories: categories }),

  setVODItems: (items, append = false) => set((state) => ({
    vodItems: append ? [...state.vodItems, ...items] : items
  })),

  setSeriesCategories: (categories) => set({ seriesCategories: categories }),

  setSeriesItems: (items, append = false) => set((state) => ({
    seriesItems: append ? [...state.seriesItems, ...items] : items
  })),

  setEpisodes: (episodes) => set({ episodes }),

  // Loading state
  setLoading: (loading) => set({ isLoading: loading }),

  setHasMoreItems: (hasMore) => set({ hasMoreItems: hasMore }),

  incrementPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),

  resetPage: () => set({ currentPage: 1 }),

  // Reset
  resetContent: () => set({
    selectedCategoryId: null,
    searchQuery: '',
    vodItems: [],
    seriesItems: [],
    episodes: [],
    currentPage: 1,
    hasMoreItems: false
  }),
}))
