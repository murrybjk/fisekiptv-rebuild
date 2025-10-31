"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { List, Tv, Star } from "lucide-react"
import type { SeriesItem } from "@/types"
import { IPTVClient } from "@/lib/api/client"
import { useConnectionStore } from "@/store/connection"
import Image from "next/image"

interface SeriesCardProps {
  series: SeriesItem
  onViewEpisodes?: (seriesId: string, seriesName: string) => void
}

export function SeriesCard({ series, onViewEpisodes }: SeriesCardProps) {
  const { serverUrl, macAddress } = useConnectionStore()

  const handleViewEpisodes = () => {
    onViewEpisodes?.(series.id, series.name)
  }

  const posterUrl = serverUrl
    ? new IPTVClient(serverUrl, macAddress).buildImageUrl(
        series.screenshot_uri || series.screenshot || series.icon,
        'series'
      )
    : new IPTVClient('', '').buildImageUrl(undefined, 'series')

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 max-w-[180px]">
      <div className="aspect-[2/3] relative overflow-hidden bg-muted">
        <Image
          src={posterUrl}
          alt={series.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {series.rating_imdb && (
          <Badge className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] px-1.5 py-0.5">
            <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
            {series.rating_imdb}
          </Badge>
        )}
      </div>

      <CardContent className="p-2">
        <h3 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {series.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          {series.year && (
            <span className="text-[10px] text-muted-foreground">{series.year}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Button
          onClick={handleViewEpisodes}
          className="w-full text-xs h-7"
          size="sm"
          variant="outline"
        >
          <List className="mr-1 h-3 w-3" />
          Episodes
        </Button>
      </CardFooter>
    </Card>
  )
}
