// ============================================================================
// API CLIENT - FisekIPTV
// ============================================================================

import type {
  Channel,
  Genre,
  VODCategory,
  VODItem,
  SeriesCategory,
  SeriesItem,
  AccountInfo,
  APIResponse
} from '@/types'
import { API_CONFIG } from '@/config/constants'

export class IPTVClient {
  private serverUrl: string
  private macAddress: string

  constructor(serverUrl: string, macAddress: string) {
    this.serverUrl = serverUrl
    this.macAddress = macAddress
  }

  // ============================================================================
  // ACCOUNT & CONNECTION
  // ============================================================================

  async fetchAccountInfo(): Promise<AccountInfo> {
    const url = `${this.serverUrl}/portal.php?type=account_info&action=get_main_info&mac=${this.macAddress}`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(API_CONFIG.defaultTimeout)
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch account info: ${response.statusText}`)
    }

    const data: APIResponse<AccountInfo> = await response.json()
    return data.js || data
  }

  // ============================================================================
  // LIVE TV / CHANNELS
  // ============================================================================

  async fetchGenres(): Promise<Genre[]> {
    const url = `${this.serverUrl}/server/load.php?type=itv&action=get_genres&mac=${this.macAddress}&JsHttpRequest=1-xml`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch genres: ${response.statusText}`)
    }

    const data: APIResponse<Genre[]> = await response.json()
    return data.js || []
  }

  async fetchChannels(): Promise<Channel[]> {
    const url = `${this.serverUrl}/server/load.php?type=itv&action=get_all_channels&mac=${this.macAddress}&JsHttpRequest=1-xml`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch channels: ${response.statusText}`)
    }

    const data: APIResponse<{ data: Channel[] }> = await response.json()
    return data.js?.data || []
  }

  async createLiveStreamLink(cmd: string): Promise<string> {
    console.log('🌐 [IPTVClient] createLiveStreamLink called:', {
      cmd,
      serverUrl: this.serverUrl,
      macAddress: this.macAddress
    })

    const url = `${this.serverUrl}/portal.php?type=itv&action=create_link&cmd=${encodeURIComponent(cmd)}&mac=${this.macAddress}`
    console.log('🌐 [IPTVClient] API URL:', url)

    const response = await fetch(url)
    console.log('🌐 [IPTVClient] Response status:', response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Failed to create stream link: ${response.statusText}`)
    }

    const data: APIResponse<{ cmd: string }> = await response.json()
    console.log('🌐 [IPTVClient] Response data:', data)

    if (!data.js?.cmd) {
      console.error('❌ [IPTVClient] No stream URL in response')
      throw new Error('No stream URL received')
    }

    console.log('🌐 [IPTVClient] Raw cmd from server:', data.js.cmd)

    // Extract URL from command string
    const urlMatch = data.js.cmd.match(/https?:\/\/[^\s]+/)
    if (!urlMatch) {
      console.error('❌ [IPTVClient] Invalid stream URL format:', data.js.cmd)
      throw new Error('Invalid stream URL format')
    }

    const extractedUrl = urlMatch[0]
    console.log('✅ [IPTVClient] Extracted stream URL:', extractedUrl)

    return extractedUrl
  }

  // ============================================================================
  // VOD / MOVIES
  // ============================================================================

  async fetchVODCategories(): Promise<VODCategory[]> {
    const url = `${this.serverUrl}/server/load.php?type=vod&action=get_categories&mac=${this.macAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch VOD categories: ${response.statusText}`)
    }

    const data: APIResponse<VODCategory[]> = await response.json()
    return data.js || []
  }

  async fetchVODItems(categoryId: string, page = 1): Promise<VODItem[]> {
    const url = `${this.serverUrl}/server/load.php?action=get_ordered_list&category=${categoryId}&p=${page}&type=vod&sortby=added&mac=${this.macAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch VOD items: ${response.statusText}`)
    }

    const data: APIResponse<{ data: VODItem[] }> = await response.json()
    return data.js?.data || []
  }

  async searchVODItems(categoryId: string, searchTerm: string): Promise<VODItem[]> {
    const url = `${this.serverUrl}/server/load.php?action=get_ordered_list&category=${categoryId}&p=1&type=vod&sortby=added&search=${encodeURIComponent(searchTerm)}&mac=${this.macAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to search VOD items: ${response.statusText}`)
    }

    const data: APIResponse<{ data: VODItem[] }> = await response.json()
    return data.js?.data || []
  }

  async createVODStreamLink(cmd: string): Promise<string> {
    const url = `${this.serverUrl}/server/load.php?action=create_link&cmd=${encodeURIComponent(cmd)}&type=vod&mac=${this.macAddress}&disable_ad=1`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to create VOD stream link: ${response.statusText}`)
    }

    const data: APIResponse<{ cmd: string }> = await response.json()

    if (!data.js?.cmd) {
      throw new Error('No stream URL received')
    }

    const urlMatch = data.js.cmd.match(/https?:\/\/[^\s]+/)
    if (!urlMatch) {
      throw new Error('Invalid stream URL format')
    }

    return urlMatch[0]
  }

  // ============================================================================
  // SERIES
  // ============================================================================

  async fetchSeriesCategories(): Promise<SeriesCategory[]> {
    const url = `${this.serverUrl}/server/load.php?type=series&action=get_categories&mac=${this.macAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch series categories: ${response.statusText}`)
    }

    const data: APIResponse<SeriesCategory[]> = await response.json()
    return data.js || []
  }

  async fetchSeriesItems(categoryId: string, page = 1): Promise<SeriesItem[]> {
    const url = `${this.serverUrl}/server/load.php?type=series&action=get_ordered_list&category=${categoryId}&p=${page}&mac=${this.macAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch series items: ${response.statusText}`)
    }

    const data: APIResponse<{ data: SeriesItem[] }> = await response.json()
    return data.js?.data || []
  }

  async searchSeriesItems(categoryId: string, searchTerm: string): Promise<SeriesItem[]> {
    const url = `${this.serverUrl}/server/load.php?type=series&action=get_ordered_list&category=${categoryId}&mac=${this.macAddress}&search=${encodeURIComponent(searchTerm)}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to search series items: ${response.statusText}`)
    }

    const data: APIResponse<{ data: SeriesItem[] }> = await response.json()
    return data.js?.data || []
  }

  async fetchEpisodes(seriesId: string) {
    const url = `${this.serverUrl}/server/load.php?movie_id=${seriesId}&type=series&action=get_ordered_list&sortby=added&p=1&mac=${this.macAddress}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.statusText}`)
    }

    const data: APIResponse<{ data: Genre[] }> = await response.json()
    return data.js?.data || []
  }

  async createEpisodeStreamLink(cmd: string): Promise<string> {
    console.log('🌐 [IPTVClient] createEpisodeStreamLink called:', {
      cmd,
      serverUrl: this.serverUrl,
      macAddress: this.macAddress
    })

    const url = `${this.serverUrl}/server/load.php?action=create_link&disable_ad=1&type=vod&cmd=${encodeURIComponent(cmd)}&mac=${this.macAddress}`
    console.log('🌐 [IPTVClient] Episode API URL:', url)

    const response = await fetch(url)
    console.log('🌐 [IPTVClient] Episode response status:', response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Failed to create episode stream link: ${response.statusText}`)
    }

    const data: APIResponse<{ cmd: string }> = await response.json()
    console.log('🌐 [IPTVClient] Episode response data:', data)

    if (!data.js?.cmd) {
      console.error('❌ [IPTVClient] No episode stream URL in response')
      throw new Error('No stream URL received')
    }

    console.log('🌐 [IPTVClient] Raw cmd from server (episode):', data.js.cmd)

    const urlMatch = data.js.cmd.match(/https?:\/\/[^\s]+/)
    if (!urlMatch) {
      console.error('❌ [IPTVClient] Invalid episode stream URL format:', data.js.cmd)
      throw new Error('Invalid stream URL format')
    }

    const extractedUrl = urlMatch[0]
    console.log('✅ [IPTVClient] Extracted episode stream URL:', extractedUrl)

    return extractedUrl
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  buildImageUrl(imagePath: string | undefined, type: 'channel' | 'movie' | 'series' = 'channel'): string {
    if (!imagePath) {
      return this.getPlaceholderImage(type)
    }

    // Handle full URLs
    if (imagePath.startsWith('http')) {
      return imagePath
    }

    // Handle relative paths
    if (imagePath.startsWith('/')) {
      return this.serverUrl + imagePath
    }

    return this.serverUrl + '/' + imagePath
  }

  private getPlaceholderImage(type: 'channel' | 'movie' | 'series'): string {
    const placeholders = {
      channel: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiM2NjYiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZD0iTTggMTVBNyA3IDAgMSAxIDggMWE3IDcgMCAwIDEgMCAxNFptMC0xMEE2IDYgMCAxIDAgOCAxNGE2IDYgMCAwIDAtNi02eiIvPjwvc3ZnPg==',
      movie: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzQ0NCIgdmlld0JveD0iMCAwIDIwIDMwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMCIgeT0iMTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMyI+TW92aWU8L3RleHQ+PC9zdmc+',
      series: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzQ0NCIgdmlld0JveD0iMCAwIDIwIDMwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMCIgeT0iMTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMyI+U2VyaWVzPC90ZXh0Pjwvc3ZnPg==',
    }
    return placeholders[type]
  }
}
