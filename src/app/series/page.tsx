"use client"

import { useEffect, useState } from "react"

// Disable static optimization to prevent SSR issues with video player
export const dynamic = 'force-dynamic'

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { MonitorPlay, ArrowLeft } from "lucide-react"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"
import { ConnectionDialog } from "@/components/features/connection-dialog"
import { VideoPlayer } from "@/components/features/video-player"
import { SeriesCard } from "@/components/features/series-card"
import { EpisodeCard } from "@/components/features/episode-card"
import { SearchBar } from "@/components/features/search-bar"
import { ViewToggle } from "@/components/features/view-toggle"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useSeries } from "@/hooks/use-series"
import { usePlayer } from "@/hooks/use-player"

export default function SeriesPage() {
  const { isConnected } = useConnectionStore()
  const { selectedCategoryId, setSelectedCategory, setTab } = useContentStore()
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null)
  const [selectedSeriesName, setSelectedSeriesName] = useState<string>("")

  const { categories, series, episodes, loading, loadCategories, loadEpisodes } = useSeries()
  const { play } = usePlayer()

  // Set current tab to series
  useEffect(() => {
    setTab('series')
  }, [setTab])

  // Derive showConnectionDialog from isConnected state
  const showConnectionDialog = !isConnected

  // Load categories on mount
  useEffect(() => {
    if (isConnected && categories.length === 0) {
      loadCategories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, categories.length])

  // Auto-select first category
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategory(categories[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length, selectedCategoryId])

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id)
    setSelectedSeriesId(null) // Reset series selection
  }

  const handleViewEpisodes = (seriesId: string, seriesName: string) => {
    setSelectedSeriesId(seriesId)
    setSelectedSeriesName(seriesName)
    loadEpisodes(seriesId, seriesName)
  }

  const handleBackToSeries = () => {
    setSelectedSeriesId(null)
    setSelectedSeriesName("")
  }

  const handlePlay = (streamUrl: string, title: string, subtitle: string) => {
    play(streamUrl, title, subtitle)
  }

  // Format categories for sidebar
  const sidebarCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.title,
    count: undefined
  }))

  if (!isConnected) {
    return (
      <>
        <ConnectionDialog
          open={showConnectionDialog}
          onOpenChange={() => {}}
        />
        <div className="flex h-screen items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MonitorPlay className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Connect to Server</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Please connect to your IPTV server to browse TV series
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Connection required
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
        <div className="flex h-screen w-full flex-col">
          <AppHeader />
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar
              categories={sidebarCategories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={handleCategorySelect}
              onRefresh={loadCategories}
              title="CATEGORIES"
            />

            <main className="flex-1 overflow-auto">
              {/* Video Player - Compact when not playing */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="p-2">
                  <VideoPlayer className="w-full h-auto" />
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                {/* Breadcrumb Navigation */}
                {selectedSeriesId && (
                  <div className="mb-6">
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink onClick={handleBackToSeries} className="cursor-pointer">
                            Series
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>{selectedSeriesName}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                )}

                {!selectedSeriesId ? (
                  // Series List View
                  <>
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="flex-1 max-w-2xl">
                        <SearchBar placeholder="Search series..." />
                      </div>
                      <ViewToggle />
                    </div>

                    {loading && series.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading series...</p>
                      </div>
                    ) : series.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <MonitorPlay className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold">No series found</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Try selecting a different category or adjusting your search
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                        {series.map((item) => (
                          <SeriesCard
                            key={item.id}
                            series={item}
                            onViewEpisodes={handleViewEpisodes}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Episodes View
                  <>
                    <div className="mb-6 flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={handleBackToSeries}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Series
                      </Button>
                      <h2 className="text-2xl font-bold">{selectedSeriesName}</h2>
                    </div>

                    {loading ? (
                      <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading episodes...</p>
                      </div>
                    ) : episodes.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <MonitorPlay className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold">No episodes found</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            This series doesn&apos;t have any episodes available
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                        {episodes.map((episode) => (
                          <EpisodeCard
                            key={episode.id}
                            episode={episode}
                            onPlay={handlePlay}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  )
}
