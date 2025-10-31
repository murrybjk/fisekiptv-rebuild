"use client"

// Disable static optimization to prevent SSR issues with video player
export const dynamic = 'force-dynamic'

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { LiveTVLayout } from "@/components/layout/live-tv-layout"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"
import { ConnectionDialog } from "@/components/features/connection-dialog"
import { useChannels } from "@/hooks/use-channels"
import { usePlayer } from "@/hooks/use-player"

export default function Home() {
  const { isConnected } = useConnectionStore()
  const { currentTab, searchQuery } = useContentStore()
  const { channels, genres, loading, reload } = useChannels()
  const { play } = usePlayer()

  // State for category filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all")

  // Derive showConnectionDialog from isConnected state
  const showConnectionDialog = !isConnected

  // Create categories from genres
  const categories = useMemo(() => [
    { id: "all", name: "All Channels", count: channels.length },
    ...Array.from(genres.entries()).map(([id, name]) => ({
      id,
      name,
      count: channels.filter(c => c.tv_genre_id === id).length
    }))
  ], [channels, genres])

  const handlePlay = (streamUrl: string, title: string) => {
    play(streamUrl, title, "Live TV")
  }

  // Filter channels by category AND search term
  const filteredChannels = useMemo(() => {
    let filtered = channels

    // Apply category filter
    if (selectedCategoryId !== "all") {
      filtered = filtered.filter(c => c.tv_genre_id === selectedCategoryId)
    }

    // Apply search filter (case-insensitive)
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [channels, selectedCategoryId, searchQuery])

  if (!isConnected) {
    return (
      <>
        <ConnectionDialog
          open={showConnectionDialog}
          onOpenChange={() => {}}
        />
        <div className="flex h-screen items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Welcome to FisekIPTV</CardTitle>
              <CardDescription>
                Please connect to your IPTV server to start streaming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Connection required to access live TV
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <ConnectionDialog
        open={showConnectionDialog}
        onOpenChange={() => {}}
      />

      <SidebarProvider>
        <AppSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
          onRefresh={reload}
          title={currentTab === 'live' ? 'GENRES' : 'CATEGORIES'}
        />

        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <AppHeader />

          {/* Smart Adaptive Layout */}
          <LiveTVLayout
            channels={filteredChannels}
            genres={genres}
            loading={loading}
            onPlay={handlePlay}
          />
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
