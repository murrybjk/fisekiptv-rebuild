/**
 * Stream URL Resolver
 *
 * Handles IPTV stream URL resolution by following redirects
 * to obtain the final tokenized stream URL.
 */

export class StreamResolver {
  /**
   * Resolves an IPTV stream URL by following redirects
   * Returns the final tokenized URL that can be played
   */
  static async resolveStreamUrl(originalUrl: string): Promise<string> {
    try {
      console.log('[StreamResolver] Resolving URL via server API:', originalUrl)

      // Skip resolution for direct VOD file URLs (MKV, MP4)
      // These are usually direct file URLs that don't need redirect following
      if (originalUrl.match(/\.(mkv|mp4|avi|mpg|mpeg)$/i)) {
        console.log('[StreamResolver] Direct video file detected, skipping resolution')
        return originalUrl
      }

      // Use server-side API to avoid CORS and HEAD request issues
      const apiUrl = `/api/resolve-stream?url=${encodeURIComponent(originalUrl)}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.warn('[StreamResolver] API reported error:', data.error)
      }

      const finalUrl = data.resolvedUrl || originalUrl
      console.log('[StreamResolver] Resolved to:', finalUrl)

      return finalUrl
    } catch (error) {
      console.error('[StreamResolver] Resolution failed:', error)
      console.log('[StreamResolver] Using original URL as fallback')

      // Fallback: use original URL
      return originalUrl
    }
  }

  /**
   * Checks if a URL needs resolution (is likely to redirect)
   */
  static needsResolution(url: string): boolean {
    // IPTV URLs that don't have tokens likely need resolution
    return !url.includes('token=') && !url.includes('.m3u8')
  }
}
