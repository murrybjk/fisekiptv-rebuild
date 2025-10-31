"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Star } from "lucide-react"
import type { Episode } from "@/types"
import { IPTVClient } from "@/lib/api/client"
import { useConnectionStore } from "@/store/connection"
import Image from "next/image"
import { toast } from "sonner"

interface EpisodeCardProps {
  episode: Episode
  onPlay?: (streamUrl: string, title: string, subtitle: string) => void
}

export function EpisodeCard({ episode, onPlay }: EpisodeCardProps) {
  const { serverUrl, macAddress } = useConnectionStore()

  const handlePlay = async () => {
    try {
      console.log('📺 [EpisodeCard] Starting playback for:', episode.name, 'cmd:', episode.cmd)
      console.log('📺 [EpisodeCard] onPlay callback exists:', !!onPlay)
      console.log('📺 [EpisodeCard] Server URL:', serverUrl)
      console.log('📺 [EpisodeCard] MAC:', macAddress)

      toast.info('Loading episode...', { description: episode.name })

      const client = new IPTVClient(serverUrl, macAddress)
      const streamUrl = await client.createEpisodeStreamLink(episode.cmd)
      console.log('✅ [EpisodeCard] Stream URL received:', streamUrl.substring(0, 80) + '...')

      if (!onPlay) {
        console.error('❌ [EpisodeCard] onPlay callback is not defined!')
        toast.error('Playback error', { description: 'onPlay callback missing' })
        return
      }

      console.log('📺 [EpisodeCard] Calling onPlay with:', streamUrl, episode.name, episode.seriesName)
      onPlay(streamUrl, episode.name, episode.seriesName)
      console.log('✅ [EpisodeCard] onPlay called successfully')
    } catch (error) {
      console.error("❌ [EpisodeCard] Failed to play episode:", error)
      toast.error('Failed to play episode', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const posterUrl = serverUrl
    ? new IPTVClient(serverUrl, macAddress).buildImageUrl(
        episode.screenshot_uri || episode.screenshot,
        'series'
      )
    : new IPTVClient('', '').buildImageUrl(undefined, 'series')

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 max-w-[220px]">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <Image
          src={posterUrl}
          alt={episode.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="rounded-full bg-primary/90 p-2 transform scale-0 group-hover:scale-100 transition-transform">
            <Play className="h-4 w-4 text-primary-foreground fill-current" />
          </div>
        </div>

        {episode.rating_imdb && (
          <Badge className="absolute top-1.5 right-1.5 bg-yellow-500/90 text-black text-[10px] px-1.5 py-0.5">
            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
            {episode.rating_imdb}
          </Badge>
        )}
      </div>

      <CardContent className="p-2">
        <h3 className="font-semibold text-xs leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {episode.name}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
          {episode.seriesName}
        </p>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Button
          onClick={handlePlay}
          className="w-full text-xs h-7"
          size="sm"
        >
          <Play className="mr-1 h-3 w-3" />
          Play
        </Button>
      </CardFooter>
    </Card>
  )
}
