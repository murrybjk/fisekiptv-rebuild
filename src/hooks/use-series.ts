import { useEffect, useState } from "react"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"
import { IPTVClient } from "@/lib/api/client"
import { toast } from "sonner"
import type { Episode } from "@/types"

export function useSeries() {
  const { serverUrl, macAddress, isConnected } = useConnectionStore()
  const {
    seriesCategories,
    seriesItems,
    episodes,
    selectedCategoryId,
    searchQuery,
    currentPage,
    setSeriesCategories,
    setSeriesItems,
    setEpisodes,
    setLoading,
    setHasMoreItems,
  } = useContentStore()
  const [error, setError] = useState<Error | null>(null)

  const loadCategories = async () => {
    if (!isConnected || !serverUrl || !macAddress) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = new IPTVClient(serverUrl, macAddress)
      const categories = await client.fetchSeriesCategories()
      setSeriesCategories(categories)
      toast.success(`Loaded ${categories.length} series categories`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load categories')
      setError(error)
      toast.error('Failed to load series categories', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSeries = async (categoryId: string, page = 1, append = false) => {
    if (!isConnected || !serverUrl || !macAddress) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = new IPTVClient(serverUrl, macAddress)

      let items
      if (searchQuery) {
        items = await client.searchSeriesItems(categoryId, searchQuery)
      } else {
        items = await client.fetchSeriesItems(categoryId, page)
      }

      setSeriesItems(items, append)
      setHasMoreItems(items.length > 0 && items.length >= 50)

      if (!append) {
        toast.success(`Loaded ${items.length} series`)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load series')
      setError(error)
      toast.error('Failed to load series', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const loadEpisodes = async (seriesId: string, seriesName: string) => {
    if (!isConnected || !serverUrl || !macAddress) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = new IPTVClient(serverUrl, macAddress)
      const seasonsData = await client.fetchEpisodes(seriesId)

      // Flatten episodes from seasons
      const flatEpisodes: Episode[] = []
      seasonsData.forEach((season: {
        id: string
        name?: string
        series?: number[]
        screenshot_uri?: string
        screenshot?: string
        description?: string
        rating_imdb?: string
        year?: string
      }) => {
        if (season.series && Array.isArray(season.series)) {
          season.series.forEach((episodeNum: number) => {
            flatEpisodes.push({
              id: `${season.id}:${episodeNum}`,
              seasonId: season.id,
              episodeNum: episodeNum,
              name: `Season ${season.name || season.id} Episode ${episodeNum}`,
              seriesName: seriesName,
              cmd: `/media/${season.id}:${episodeNum}.mpg`,
              screenshot_uri: season.screenshot_uri || '',
              screenshot: season.screenshot || '',
              description: season.description || '',
              rating_imdb: season.rating_imdb || '',
              year: season.year || '',
              type: 'episode'
            })
          })
        }
      })

      // Sort episodes
      flatEpisodes.sort((a, b) => {
        if (a.seasonId !== b.seasonId) {
          return parseInt(a.seasonId) - parseInt(b.seasonId)
        }
        return a.episodeNum - b.episodeNum
      })

      setEpisodes(flatEpisodes)
      toast.success(`Loaded ${flatEpisodes.length} episodes`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load episodes')
      setError(error)
      toast.error('Failed to load episodes', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && seriesCategories.length === 0) {
      loadCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, seriesCategories.length])

  useEffect(() => {
    if (selectedCategoryId && isConnected) {
      loadSeries(selectedCategoryId, currentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, searchQuery, isConnected])

  return {
    categories: seriesCategories,
    series: seriesItems,
    episodes,
    loading: useContentStore.getState().isLoading,
    error,
    loadCategories,
    loadSeries,
    loadEpisodes,
  }
}
