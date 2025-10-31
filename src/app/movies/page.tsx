"use client"

import { useEffect } from "react"

// Disable static optimization to prevent SSR issues with video player
export const dynamic = 'force-dynamic'
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Film } from "lucide-react"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"
import { ConnectionDialog } from "@/components/features/connection-dialog"
import { VideoPlayer } from "@/components/features/video-player"
import { MovieCard } from "@/components/features/movie-card"
import { SearchBar } from "@/components/features/search-bar"
import { ViewToggle } from "@/components/features/view-toggle"
import { useMovies } from "@/hooks/use-movies"
import { usePlayer } from "@/hooks/use-player"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function MoviesPage() {
  const { isConnected } = useConnectionStore()
  const { selectedCategoryId, setSelectedCategory, currentPage, incrementPage, setTab } = useContentStore()

  const { categories, movies, loading, loadCategories, loadMovies } = useMovies()
  const { play } = usePlayer()

  // Set current tab to movies
  useEffect(() => {
    setTab('movies')
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
  }

  const handlePlay = (streamUrl: string, title: string) => {
    play(streamUrl, title, "Movie")
  }

  const handleLoadMore = () => {
    if (selectedCategoryId && !loading) {
      incrementPage()
      loadMovies(selectedCategoryId, currentPage + 1, true)
    }
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
              <Film className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Connect to Server</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Please connect to your IPTV server to browse movies
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
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex-1 max-w-2xl">
                    <SearchBar placeholder="Search movies..." />
                  </div>
                  <ViewToggle />
                </div>

                {loading && movies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading movies...</p>
                  </div>
                ) : movies.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Film className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No movies found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try selecting a different category or adjusting your search
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                      {movies.map((movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onPlay={handlePlay}
                        />
                      ))}
                    </div>

                    {/* Load More Button */}
                    <div className="mt-8 flex justify-center">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loading}
                        variant="outline"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More Movies'
                        )}
                      </Button>
                    </div>
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
