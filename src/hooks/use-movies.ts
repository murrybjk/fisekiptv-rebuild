import { useEffect, useState } from "react"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"
import { IPTVClient } from "@/lib/api/client"
import { toast } from "sonner"
import type { VODCategory } from "@/types"

export function useMovies() {
  const { serverUrl, macAddress, isConnected } = useConnectionStore()
  const {
    vodCategories,
    vodItems,
    selectedCategoryId,
    searchQuery,
    currentPage,
    setVODCategories,
    setVODItems,
    setLoading,
    setHasMoreItems,
  } = useContentStore()
  const [error, setError] = useState<Error | null>(null)

  const loadCategories = async (): Promise<VODCategory[]> => {
    if (!isConnected || !serverUrl || !macAddress) {
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const client = new IPTVClient(serverUrl, macAddress)
      const categories = await client.fetchVODCategories()
      setVODCategories(categories)
      toast.success(`Loaded ${categories.length} movie categories`)
      return categories
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load categories')
      setError(error)
      toast.error('Failed to load movie categories', {
        description: error.message
      })
      return []
    } finally {
      setLoading(false)
    }
  }

  const loadMovies = async (categoryId: string, page = 1, append = false) => {
    if (!isConnected || !serverUrl || !macAddress) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = new IPTVClient(serverUrl, macAddress)

      let items
      if (searchQuery) {
        items = await client.searchVODItems(categoryId, searchQuery)
      } else {
        items = await client.fetchVODItems(categoryId, page)
      }

      setVODItems(items, append)
      setHasMoreItems(items.length > 0 && items.length >= 50)

      if (!append) {
        toast.success(`Loaded ${items.length} movies`)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load movies')
      setError(error)
      toast.error('Failed to load movies', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && vodCategories.length === 0) {
      loadCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, vodCategories.length])

  useEffect(() => {
    if (selectedCategoryId && isConnected) {
      loadMovies(selectedCategoryId, currentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, searchQuery, isConnected])

  return {
    categories: vodCategories,
    movies: vodItems,
    loading: useContentStore.getState().isLoading,
    error,
    loadCategories,
    loadMovies,
  }
}
