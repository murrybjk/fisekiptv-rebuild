// ============================================================================
// TYPE DEFINITIONS - FisekIPTV
// ============================================================================

export interface Channel {
  id: string
  name: string
  number: number
  logo: string
  cmd: string
  tv_genre_id: string
}

export interface Genre {
  id: string
  title: string
}

export interface VODCategory {
  id: string
  title: string
  alias?: string
  censored?: string
}

export interface VODItem {
  id: string
  name: string
  screenshot_uri?: string
  screenshot?: string
  icon?: string
  cmd: string
  year?: string
  description?: string
  rating_imdb?: string
  actors?: string
  director?: string
}

export interface SeriesCategory {
  id: string
  title: string
  alias?: string
  censored?: string
}

export interface SeriesItem {
  id: string
  name: string
  screenshot_uri?: string
  screenshot?: string
  icon?: string
  cmd: string
  description?: string
  year?: string
  rating_imdb?: string
}

export interface Episode {
  id: string
  seasonId: string
  episodeNum: number
  name: string
  seriesName: string
  cmd: string
  screenshot_uri?: string
  screenshot?: string
  description?: string
  rating_imdb?: string
  year?: string
  actors?: string
  director?: string
  type: 'episode'
}

export interface ConnectionState {
  serverUrl: string
  macAddress: string
  isConnected: boolean
  accountInfo?: AccountInfo
}

export interface AccountInfo {
  phone?: string
  max_connections?: string
  account?: {
    login?: string
    password?: string
  }
}

export type ContentTab = 'live' | 'movies' | 'series'
export type ViewMode = 'grid' | 'list'

export interface APIResponse<T = unknown> {
  js: T
}
