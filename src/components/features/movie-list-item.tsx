"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Film, Star } from "lucide-react"
import type { VODItem } from "@/types"
import { IPTVClient } from "@/lib/api/client"
import { useConnectionStore } from "@/store/connection"
import Image from "next/image"

interface MovieListItemProps {
  movie: VODItem
  onPlay?: (streamUrl: string, title: string) => void
}

export function MovieListItem({ movie, onPlay }: MovieListItemProps) {
  const { serverUrl, macAddress } = useConnectionStore()

  const handlePlay = async () => {
    try {
      const client = new IPTVClient(serverUrl, macAddress)
      const streamUrl = await client.createVODStreamLink(movie.cmd)
      onPlay?.(streamUrl, movie.name)
    } catch (error) {
      console.error("Failed to play movie:", error)
    }
  }

  const posterUrl = serverUrl
    ? new IPTVClient(serverUrl, macAddress).buildImageUrl(
        movie.screenshot_uri || movie.screenshot || movie.icon,
        'movie'
      )
    : new IPTVClient('', '').buildImageUrl(undefined, 'movie')

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-36 flex-shrink-0 rounded-md overflow-hidden bg-muted">
            <Image
              src={posterUrl}
              alt={movie.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {movie.name}
            </h3>

            <div className="flex items-center gap-2 mt-2">
              {movie.year && (
                <span className="text-sm text-muted-foreground">{movie.year}</span>
              )}
              {movie.rating_imdb && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                  {movie.rating_imdb}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                <Film className="h-3 w-3 mr-1" />
                Movie
              </Badge>
            </div>

            {movie.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {movie.description}
              </p>
            )}
          </div>

          <Button onClick={handlePlay} size="lg">
            <Play className="mr-2 h-5 w-5" />
            Play Movie
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
