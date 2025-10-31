"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Tv } from "lucide-react"
import type { Channel } from "@/types"
import { IPTVClient } from "@/lib/api/client"
import { useConnectionStore } from "@/store/connection"

interface ChannelCardProps {
  channel: Channel
  genreName?: string
  onPlay?: (streamUrl: string, title: string) => void
}

export function ChannelCard({ channel, genreName, onPlay }: ChannelCardProps) {
  const { serverUrl, macAddress } = useConnectionStore()

  const handlePlay = async () => {
    try {
      console.log('🎬 [ChannelCard] Play clicked:', {
        channelName: channel.name,
        channelId: channel.id,
        cmd: channel.cmd
      })

      const client = new IPTVClient(serverUrl, macAddress)
      const streamUrl = await client.createLiveStreamLink(channel.cmd)

      console.log('🎬 [ChannelCard] Stream URL received:', streamUrl)

      onPlay?.(streamUrl, channel.name)
    } catch (error) {
      console.error("❌ [ChannelCard] Failed to play channel:", error)
    }
  }

  const imageUrl = serverUrl && channel.logo
    ? new IPTVClient(serverUrl, macAddress).buildImageUrl(channel.logo, 'channel')
    : undefined

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 max-w-[160px]">
      <CardContent className="p-2">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-12 w-12 border border-border/50 group-hover:border-primary/50 transition-colors">
            <AvatarImage src={imageUrl} alt={channel.name} />
            <AvatarFallback className="bg-secondary">
              <Tv className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="w-full text-center">
            <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
              {channel.name}
            </h3>
            {genreName && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {genreName}
              </p>
            )}
            {channel.number && (
              <span className="text-xs text-muted-foreground/70">
                #{channel.number}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Button
          onClick={handlePlay}
          className="w-full font-medium"
          size="sm"
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Watch Live
        </Button>
      </CardFooter>
    </Card>
  )
}
