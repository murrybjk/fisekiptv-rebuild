"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Film, Star } from "lucide-react"
import type { VODItem } from "@/types"
import { IPTVClient } from "@/lib/api/client"
import { useConnectionStore } from "@/store/connection"
import Image from "next/image"

interface MovieCardProps {
  movie: VODItem
  onPlay?: (streamUrl: string, title: string) => void
}

export function MovieCard({ movie, onPlay }: MovieCardProps) {
  const { serverUrl, macAddress } = useConnectionStore()

  const handlePlay = async () => {
    try {
      console.log('🎬 [MovieCard] Starting playback for:', movie.name, 'cmd:', movie.cmd)
      console.log('🎬 [MovieCard] onPlay callback exists:', !!onPlay)
      console.log('🎬 [MovieCard] Server URL:', serverUrl)
      console.log('🎬 [MovieCard] MAC:', macAddress)

      const client = new IPTVClient(serverUrl, macAddress)
      const streamUrl = await client.createVODStreamLink(movie.cmd)
      console.log('✅ [MovieCard] Stream URL received:', streamUrl.substring(0, 80) + '...')

      if (!onPlay) {
        console.error('❌ [MovieCard] onPlay callback is not defined!')
        return
      }

      console.log('🎬 [MovieCard] Calling onPlay with:', streamUrl, movie.name)
      onPlay(streamUrl, movie.name)
      console.log('✅ [MovieCard] onPlay called successfully')
    } catch (error) {
      console.error("❌ [MovieCard] Failed to play movie:", error)
    }
  }

  const posterUrl = serverUrl
    ? new IPTVClient(serverUrl, macAddress).buildImageUrl(
        movie.screenshot_uri || movie.screenshot || movie.icon,
        'movie'
      )
    : new IPTVClient('', '').buildImageUrl(undefined, 'movie')

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 max-w-[180px]">
      <div className="aspect-[2/3] relative overflow-hidden bg-muted">
        <Image
          src={posterUrl}
          alt={movie.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {movie.rating_imdb && (
          <Badge className="absolute top-2 right-2 bg-amber-500/95 text-black font-semibold shadow-lg text-[10px] px-1.5 py-0.5">
            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
            {movie.rating_imdb}
          </Badge>
        )}
      </div>

      <CardContent className="p-2">
        <h3 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {movie.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          {movie.year && (
            <span className="text-[10px] text-muted-foreground font-medium">{movie.year}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Button
          onClick={handlePlay}
          className="w-full font-medium text-xs h-7"
          size="sm"
        >
          <Play className="mr-1 h-3 w-3" />
          Play
        </Button>
      </CardFooter>
    </Card>
  )
}
