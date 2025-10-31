"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Tv } from "lucide-react"
import type { Channel } from "@/types"
import { IPTVClient } from "@/lib/api/client"
import { useConnectionStore } from "@/store/connection"

interface ChannelListItemProps {
  channel: Channel
  genreName?: string
  onPlay?: (streamUrl: string, title: string) => void
}

export function ChannelListItem({ channel, genreName, onPlay }: ChannelListItemProps) {
  const { serverUrl, macAddress } = useConnectionStore()

  const handlePlay = async () => {
    try {
      const client = new IPTVClient(serverUrl, macAddress)
      const streamUrl = await client.createLiveStreamLink(channel.cmd)
      onPlay?.(streamUrl, channel.name)
    } catch (error) {
      console.error("Failed to play channel:", error)
    }
  }

  const imageUrl = serverUrl && channel.logo
    ? new IPTVClient(serverUrl, macAddress).buildImageUrl(channel.logo, 'channel')
    : undefined

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={imageUrl} alt={channel.name} />
            <AvatarFallback>
              <Tv className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
              {channel.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {genreName && (
                <Badge variant="secondary" className="text-xs">
                  {genreName}
                </Badge>
              )}
              {channel.number && (
                <span className="text-sm text-muted-foreground">
                  Channel #{channel.number}
                </span>
              )}
            </div>
          </div>

          <Button onClick={handlePlay} size="lg">
            <Play className="mr-2 h-5 w-5" />
            Watch Live
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
