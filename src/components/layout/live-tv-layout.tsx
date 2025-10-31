"use client"

import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Tv } from "lucide-react"
import { usePlayerStore } from "@/store/player"
import { ChannelCard } from "@/components/features/channel-card"
import { SearchBar } from "@/components/features/search-bar"
import { ViewToggle } from "@/components/features/view-toggle"
import type { Channel } from "@/types"
import { cn } from "@/lib/utils"

// Dynamic import for VideoPlayer
const VideoPlayer = dynamic(
  () => import("@/components/features/video-player").then(mod => ({ default: mod.VideoPlayer })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[200px] bg-black/50 rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading player...</div>
      </div>
    )
  }
)

interface LiveTVLayoutProps {
  channels: Channel[]
  genres: Map<string, string>
  loading: boolean
  onPlay: (streamUrl: string, title: string) => void
}

export function LiveTVLayout({ channels, genres, loading, onPlay }: LiveTVLayoutProps) {
  const { isPlaying, isMinimized } = usePlayerStore()

  /**
   * Layout Logic:
   *
   * NOT PLAYING:
   *   - Show collapsed player (200px height)
   *   - Channels take rest of space
   *
   * PLAYING + MINIMIZED:
   *   - Player at top (300px height)
   *   - Channels visible below with scroll
   *
   * PLAYING + NOT MINIMIZED:
   *   - Side-by-side layout
   *   - Player: 55% width
   *   - Channels: 45% width with scroll
   */

  const layoutMode = !isPlaying
    ? 'collapsed'
    : isMinimized
      ? 'minimized'
      : 'side-by-side'

  return (
    <div className={cn(
      "flex-1 flex min-h-0",
      // Always side-by-side when playing, stack vertically when not playing or on mobile
      layoutMode === 'side-by-side' ? "flex-row" : "flex-col"
    )}>

      {/* Player Section */}
      <div className={cn(
        "transition-all duration-300 ease-in-out shrink-0",
        // Collapsed (not playing): Minimal height, full width
        layoutMode === 'collapsed' && "w-full h-[80px]",
        // Minimized (playing but minimized): Medium height, full width
        layoutMode === 'minimized' && "w-full h-[350px]",
        // Side-by-side (playing): Fixed 45% width, full height
        layoutMode === 'side-by-side' && "w-[45%] h-full"
      )}>
        <div className={cn(
          "h-full p-2 md:p-3 border-border/50",
          layoutMode === 'collapsed' && "bg-background/50 border-b",
          layoutMode === 'minimized' && "bg-background/95 backdrop-blur-lg border-b",
          layoutMode === 'side-by-side' && "bg-background/95 backdrop-blur-lg border-r"
        )}>
          <VideoPlayer className="h-full" />
        </div>
      </div>

      {/* Channels Section */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0 overflow-hidden",
        layoutMode === 'side-by-side' && "w-[55%]"
      )}>
        {/* Search & View Toggle */}
        <div className="shrink-0 p-3 md:p-4 border-b border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex-1">
              <SearchBar placeholder="Search channels..." />
            </div>
            <ViewToggle />
          </div>
        </div>

        {/* Channels Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/95">
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-6 text-muted-foreground font-medium">Loading channels...</p>
              </div>
            ) : channels.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Tv className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No channels found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try selecting a different category or refresh the list
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                "grid gap-2",
                // Compact responsive grid - more channels visible
                layoutMode === 'side-by-side'
                  ? "grid-cols-3 2xl:grid-cols-4"
                  : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
              )}>
                {channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    genreName={genres.get(channel.tv_genre_id)}
                    onPlay={onPlay}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
