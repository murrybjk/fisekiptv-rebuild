import { useEffect, useState } from "react"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"
import { IPTVClient } from "@/lib/api/client"
import { toast } from "sonner"

export function useChannels() {
  const { serverUrl, macAddress, isConnected } = useConnectionStore()
  const { channels, genres, setChannels, setGenres, setLoading } = useContentStore()
  const [error, setError] = useState<Error | null>(null)

  const loadChannels = async () => {
    if (!isConnected || !serverUrl || !macAddress) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const client = new IPTVClient(serverUrl, macAddress)

      // Load genres first
      const genresData = await client.fetchGenres()
      setGenres(genresData)

      // Load channels
      const channelsData = await client.fetchChannels()
      setChannels(channelsData)

      toast.success(`Loaded ${channelsData.length} channels`)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load channels')
      setError(error)
      toast.error('Failed to load channels', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && channels.length === 0) {
      loadChannels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  return {
    channels,
    genres,
    loading: useContentStore.getState().isLoading,
    error,
    reload: loadChannels
  }
}
